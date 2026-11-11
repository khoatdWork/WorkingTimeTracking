"""Actual useTracker/repository/sync in browsers; only Firebase transport/auth are fixtures."""
import json
from copy import deepcopy
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = "http://127.0.0.1:3101/tests/e2e/sync-fixture.html"
KEY = "du-gio.tracker.v1"
EMPTY = {"schema": 1, "version": 0, "settings": {"dailyMinutes": 480, "lunchMinutes": 60, "wfhLimit": 3}, "days": {}}
DAY = {"date": "2026-11-02", "kind": "work", "mode": "wfh", "request": "sent", "sessions": [], "wfhHours": 8, "note": "cloud"}

def main():
    Path("output/playwright/P5").mkdir(parents=True, exist_ok=True)
    Path("output/playwright/P9").mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        for engine in ["chromium", "webkit"]:
            browser = getattr(p, engine).launch(headless=True)
            context = browser.new_context(service_workers="block")
            remote = {"a": {**deepcopy(EMPTY), "version": 4, "days": {DAY["date"]: deepcopy(DAY)}}, "b": deepcopy(EMPTY)}
            writes = []
            failed = False
            def cloud(route):
                uid = route.request.url.rsplit("/", 1)[-1]
                if route.request.method == "POST":
                    if failed:
                        route.fulfill(status=503, body="failed")
                        return
                    remote[uid] = json.loads(route.request.post_data)
                    writes.append(uid)
                route.fulfill(content_type="application/json", body=json.dumps(remote[uid]))
            context.route("**/fixture-cloud/*", cloud)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(URL)
            page.wait_for_load_state("networkidle")
            page.evaluate("localStorage.setItem('fixture-user', 'a')")
            page.reload()
            expect(page.locator("#pending")).to_have_text("false")
            page.wait_for_function("JSON.parse(document.querySelector('#state').textContent)?.days['2026-11-02']?.wfhHours === 8")
            assert writes == []
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].wfhHours") == 8

            # Signed-in offline saves survive closing and reopening the page.
            context.set_offline(True)
            page.get_by_role("button", name="Lưu 10 giờ").click()
            expect(page.locator("#pending")).to_have_text("true")
            page.close()
            page = context.new_page()
            page.on("pageerror", lambda e: errors.append(str(e)))
            # Serve fixture assets online, while navigator reports offline before the hook loads.
            context.set_offline(False)
            page.add_init_script("Object.defineProperty(navigator, 'onLine', {configurable:true, get:()=>false})")
            page.goto(URL)
            page.wait_for_load_state("networkidle")
            expect(page.locator("#pending")).to_have_text("true")
            assert json.loads(page.locator("#state").text_content())["days"][DAY["date"]]["wfhHours"] == 10
            assert writes == []
            page.evaluate("Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>true}); window.dispatchEvent(new Event('online'))")
            expect(page.locator("#pending")).to_have_text("false")
            assert remote["a"]["days"][DAY["date"]]["wfhHours"] == 10

            # Clean local data receives server changes via the realtime callback.
            remote["a"]["version"] += 1
            remote["a"]["settings"]["lunchMinutes"] = 30
            page.evaluate("window.dispatchEvent(new Event('fixture-remote'))")
            page.wait_for_function("JSON.parse(document.querySelector('#state').textContent).settings.lunchMinutes === 30")

            # A rejected Firebase write keeps an explicit pending local backup.
            failed = True
            page.get_by_role("button", name="Lưu 10 giờ").click()
            expect(page.locator("#error")).to_contain_text("rejected")
            expect(page.locator("#pending")).to_have_text("true")
            failed = False
            page.evaluate("window.dispatchEvent(new Event('online'))")
            expect(page.locator("#pending")).to_have_text("false")
            page.get_by_role("button", name="Tài khoản B").click()
            expect(page.locator("#user")).to_have_text("b")
            expect(page.locator("#syncing")).to_have_text("false")
            page.wait_for_function("JSON.parse(document.querySelector('#state').textContent)?.days && Object.keys(JSON.parse(document.querySelector('#state').textContent).days).length === 0")
            assert "b" not in writes
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].wfhHours") == 10

            # Existing guest local data is uploaded on login/open, never replaced by cloud.
            fresh = browser.new_context(service_workers="block")
            fresh.route("**/fixture-cloud/*", cloud)
            local = {**deepcopy(EMPTY), "version": 2, "days": {DAY["date"]: {**DAY, "wfhHours": 10, "note": "local wins"}}}
            fresh.add_init_script(f"localStorage.setItem('fixture-user','a'); if (!localStorage.getItem('{KEY}:a')) localStorage.setItem('{KEY}', {json.dumps(json.dumps(local))});")
            start = fresh.new_page()
            start.goto(URL)
            start.wait_for_load_state("networkidle")
            expect(start.locator("#pending")).to_have_text("false")
            assert remote["a"]["days"][DAY["date"]]["note"] == "local wins"
            fresh.close()

            # Storage notices belong only to account settings; sync never replaces drafts.
            ui = context.new_page()
            ui.set_viewport_size({"width": 320, "height": 900})
            ui.on("pageerror", lambda e: errors.append(str(e)))
            ui.goto(URL + "?ui")
            ui.wait_for_load_state("networkidle")
            synced = ui.get_by_text("Đã lưu local · Đã đồng bộ Firebase", exact=True)
            expect(synced).to_have_count(0)
            expect(ui.locator(".storage-label")).to_have_count(0)
            ui.get_by_role("button", name="Cài đặt", exact=True).click()
            expect(synced).to_have_count(0)
            ui.get_by_role("button", name="Tài khoản & đồng bộ", exact=True).click()
            expect(synced).to_be_visible()
            ui.get_by_role("button", name="Hôm nay", exact=True).click()
            ui.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
            ui.get_by_role("button", name="Work from home", exact=True).click()
            ui.get_by_role("button", name="10 giờ", exact=True).click()
            failed = True
            ui.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(ui.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ")).to_be_visible()
            ui.get_by_role("button", name="Cài đặt", exact=True).click()
            ui.get_by_role("button", name="Tài khoản & đồng bộ", exact=True).click()
            retry = ui.get_by_role("button", name="Thử đồng bộ lại", exact=True)
            expect(retry).to_be_visible()
            retry.click()
            expect(retry).to_be_enabled()
            expect(ui.get_by_text("Firebase write rejected", exact=False)).to_be_visible()
            assert ui.evaluate("document.documentElement.scrollWidth <= innerWidth")
            ui.screenshot(path=f"output/playwright/P9/{engine}-sync-account-error-320.png", full_page=True)
            for screen in ["Lịch sử", "Báo cáo", "Hôm nay"]:
                ui.get_by_role("button", name=screen, exact=True).click()
                expect(retry).to_have_count(0)
                expect(synced).to_have_count(0)
            ui.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
            ui.get_by_label("Ghi chú").fill("Bản nháp cần giữ")
            failed = False
            ui.evaluate("window.dispatchEvent(new Event('online'))")
            ui.wait_for_function("JSON.parse(localStorage.getItem('du-gio.tracker.v1:b')).dirty === false")
            expect(ui.get_by_label("Ghi chú")).to_have_value("Bản nháp cần giữ")
            expect(synced).to_have_count(0)
            ui.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(ui.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ")).to_be_visible()
            ui.get_by_role("button", name="Cài đặt", exact=True).click()
            ui.get_by_role("button", name="Tài khoản & đồng bộ", exact=True).click()
            expect(synced).to_be_visible()
            ui.screenshot(path=f"output/playwright/P5/{engine}-sync-ui.png", full_page=True)
            ui.close()
            assert not errors, errors
            page.screenshot(path=f"output/playwright/P5/{engine}-sync.png")
            browser.close()
            print(f"{engine}: startup pull/local backup/offline reopen/reconnect push/realtime pull/failure/account isolation PASS")

if __name__ == "__main__":
    main()
