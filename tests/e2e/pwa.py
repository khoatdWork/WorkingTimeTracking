import json
import os
import re
import socket
import struct
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get("APP_URL", "http://127.0.0.1:3100/")
HOSTED = urlparse(BASE_URL).hostname not in {"localhost", "127.0.0.1", "::1"}
OUT = Path("output/playwright/P3")
OUT.mkdir(parents=True, exist_ok=True)


def controlled(page):
    page.wait_for_function("navigator.serviceWorker.controller !== null")


def offline_suite(browser, engine, url=BASE_URL, release=None):
    root = urlparse(url).path
    context = browser.new_context(viewport={"width": 320, "height": 900}, locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(url)
    page.wait_for_load_state("networkidle")
    controlled(page)
    assert page.evaluate("async () => (await navigator.serviceWorker.getRegistration()).scope") == url
    if engine == "chromium":
        installability = context.new_cdp_session(page).send("Page.getInstallabilityErrors")
        assert not installability["installabilityErrors"], installability
    manifest_link = page.locator('link[rel="manifest"]').get_attribute("href")
    assert manifest_link == root + "manifest.webmanifest", manifest_link
    manifest = page.evaluate("async (url) => (await fetch(url)).json()", manifest_link)
    assert manifest["id"] == manifest["scope"] == manifest["start_url"] == root
    assert manifest["display"] == "standalone" and manifest["lang"] == "vi"
    assert {i["purpose"] for i in manifest["icons"]} == {"any", "maskable"}
    for icon in manifest["icons"] + [{"src": root + "icons/apple-touch-icon.png", "sizes": "180x180"}]:
        response = context.request.get(urlparse(url)._replace(path=icon["src"]).geturl())
        assert response.ok and response.headers["content-type"].startswith("image/png")
        width, height = struct.unpack(">II", response.body()[16:24])
        assert f"{width}x{height}" == icon["sizes"]
    page.get_by_role("button", name="Cài đặt", exact=True).click()
    expect(page.get_by_text("Giao diện đã sẵn sàng", exact=False)).to_be_visible()
    if engine == "webkit" and release is None:
        assert not errors, errors
        context.close()
        print("PASS WebKit hosted PWA: manifest/icons/worker/ready. Offline navigation tested with local server refusal; WebKit offline emulation cannot navigate through workers.")
        return
    page.get_by_role("button", name="Hôm nay", exact=True).click()
    context.set_offline(True)
    expect(page.get_by_role("status").filter(has_text="Đang mất mạng")).to_be_visible()
    if release is not None:
        # WebKit's emulated offline navigation fails before consulting its worker.
        # Refuse every server request instead; cached navigation must still work.
        context.set_offline(False)
        release["online"] = False
    page.get_by_role("button", name="Đã lên công ty", exact=True).click()
    expect(page.get_by_text("Đang làm việc", exact=True)).to_be_visible()
    page.reload()
    expect(page.get_by_text("Đang làm việc", exact=True)).to_be_visible()
    page.wait_for_function("Date.now() - JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days[Object.keys(JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days)[0]].sessions[0].start >= 2000")
    page.get_by_role("button", name="Tạm dừng", exact=True).click()
    expect(page.get_by_role("button", name="Tiếp tục làm việc", exact=True)).to_be_visible()
    ledger = page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1'))")
    assert ledger["version"] == 2
    assert next(iter(ledger["days"].values()))["sessions"][0]["end"] is not None
    page.close()
    page = context.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(url)
    expect(page.get_by_role("button", name="Tiếp tục làm việc", exact=True)).to_be_visible()
    page.get_by_role("link", name="Đủ giờ, trang chủ", exact=True).click()
    expect(page.get_by_role("button", name="Tiếp tục làm việc", exact=True)).to_be_visible()
    page.get_by_role("button", name="Cài đặt", exact=True).click()
    expect(page.get_by_role("heading", name="Cài ứng dụng", exact=True)).to_be_visible()
    page.evaluate("document.fonts.ready")
    page.screenshot(path=str(OUT / f"{engine}-offline-settings.png"), full_page=True)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.add_script_tag(content=Path("node_modules/axe-core/axe.min.js").read_text(encoding="utf-8"))
    violations = page.evaluate("async () => (await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(x=>x.id)")
    assert not violations, violations
    cache_urls = page.evaluate("""async () => {
      const urls = [];
      for (const key of await caches.keys()) for (const request of await (await caches.open(key)).keys()) urls.push(request.url);
      return urls;
    }""")
    assert cache_urls and all(cached.startswith(url) for cached in cache_urls), cache_urls
    assert not any("googleapis" in url or "/users/" in url for url in cache_urls)
    context.set_offline(False)
    if release is not None:
        release["online"] = True
    expect(page.locator(".connection-notice")).to_have_count(0)
    page.reload()
    expect(page.get_by_role("button", name="Tiếp tục làm việc", exact=True)).to_be_visible()
    assert page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1'))") == ledger
    assert not errors, errors
    print(f"PASS {engine} PWA: manifest, icons, scope, offline check-in/pause/reload/new window, settings/axe320, reconnect, cache privacy.")
    context.close()


@contextmanager
def release_server():
    # Separate localhost fixture; deployment artifacts are never modified.
    worker = Path("out/sw.js").read_text(encoding="utf-8")
    root = json.loads(Path("out/manifest.webmanifest").read_text(encoding="utf-8"))["scope"]
    release = {"version": 1, "online": True}

    class ReleaseHandler(SimpleHTTPRequestHandler):
        def handle(self):
            try:
                super().handle()
            except ConnectionError:
                # Browsers cancel remaining downloads when failed precache rolls back.
                pass

        def translate_path(self, path):
            path = urlparse(path).path
            return super().translate_path("/" + path.removeprefix(root))

        def do_GET(self):
            if not release["online"]:
                self.connection.shutdown(socket.SHUT_RDWR)
                self.connection.close()
                return
            if self.path == root + "sw.js":
                source = worker
                if release["version"] > 1:
                    source = re.sub(r'(const CACHE = "[^"]+)', rf'\g<1>-fixture-v{release["version"]}', source, count=1)
                if release["version"] == 3:
                    source = source.replace("const ASSETS = [", f'const ASSETS = ["{root}missing-build-file.js",')
                data = source.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/javascript")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            else:
                super().do_GET()

        def log_message(self, *_):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(ReleaseHandler, directory=str(Path("out").resolve())))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        yield f"http://127.0.0.1:{server.server_port}{root}", release
    finally:
        server.shutdown()
        server.server_close()


def update_suite(browser, url, release):
    context = browser.new_context(locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh")
    try:
        draft = context.new_page()
        draft.goto(url)
        draft.wait_for_load_state("networkidle")
        controlled(draft)
        draft.evaluate("async () => { const cache = await caches.open('another-pages-app'); await cache.put('/unrelated', new Response('keep')); }")
        draft.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
        draft.get_by_label("Ghi chú").fill("Giữ bản nháp khi cập nhật PWA")
        updater = context.new_page()
        updater.goto(url)
        updater.get_by_role("button", name="Cài đặt", exact=True).click()
        updater.get_by_label("Tự trừ nghỉ trưa (phút/ngày)").fill("30")
        release["version"] = 2
        updater.evaluate("async () => (await navigator.serviceWorker.getRegistration()).update()")
        button = updater.get_by_role("button", name="Cập nhật ứng dụng", exact=True)
        expect(button).to_be_visible()
        expect(draft.get_by_label("Ghi chú")).to_have_value("Giữ bản nháp khi cập nhật PWA")
        button.click()
        updater.get_by_role("button", name="Để sau", exact=True).click()
        expect(updater.get_by_label("Tự trừ nghỉ trưa (phút/ngày)")).to_have_value("30")
        updater.get_by_label("Tự trừ nghỉ trưa (phút/ngày)").fill("60")
        updater.get_by_role("button", name="Lưu cài đặt", exact=True).click()
        button.click()
        updater.get_by_role("button", name="Cập nhật và tải lại", exact=True).click()
        expect(updater.get_by_role("heading", name="Hôm nay", exact=True)).to_be_visible()
        expect(draft.get_by_label("Ghi chú")).to_have_value("Giữ bản nháp khi cập nhật PWA")
        assert updater.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).version") == 1
        assert updater.evaluate("async () => (await (await caches.open('another-pages-app')).match('/unrelated')).text()") == "keep"
        context.set_offline(True)
        updater.reload()
        expect(updater.get_by_role("button", name="Đã lên công ty", exact=True)).to_be_visible()
        context.set_offline(False)
        release["version"] = 3
        updater.evaluate("""async () => {
          const registration = await navigator.serviceWorker.getRegistration();
          const failed = new Promise(resolve => registration.addEventListener('updatefound', () => {
            const worker = registration.installing;
            worker.addEventListener('statechange', () => { if (worker.state === 'redundant') resolve(true); });
          }, {once:true}));
          await registration.update();
          return failed;
        }""")
        assert updater.evaluate("async () => !(await caches.keys()).some(key => key.endsWith('fixture-v3'))")
        assert updater.evaluate("async () => !(await navigator.serviceWorker.getRegistration()).waiting")
        context.set_offline(True)
        updater.reload()
        expect(updater.get_by_role("button", name="Đã lên công ty", exact=True)).to_be_visible()
        print("PASS PWA update: explicit confirmation/cancel, one-window reload, other draft/ledger/cache retained, failed install rollback/offline.")
    finally:
        context.close()


def main():
    with sync_playwright() as p:
        for engine in ["chromium", "webkit"]:
            browser = getattr(p, engine).launch(headless=True)
            try:
                if engine == "webkit" and not HOSTED:
                    with release_server() as (url, release):
                        offline_suite(browser, engine, url, release)
                else:
                    offline_suite(browser, engine)
                if engine == "chromium" and not HOSTED:
                    with release_server() as (url, release):
                        update_suite(browser, url, release)
            finally:
                browser.close()


if __name__ == "__main__":
    main()
