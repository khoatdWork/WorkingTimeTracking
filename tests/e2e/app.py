import json
import os
from pathlib import Path
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get("APP_URL", "http://127.0.0.1:3000")
OUT = Path("output/playwright/P1")
OUT.mkdir(parents=True, exist_ok=True)

def main():
    with sync_playwright() as p:
        for engine in ["chromium", "webkit"]:
            browser = getattr(p, engine).launch(headless=True)
            context = browser.new_context(viewport={"width": 390, "height": 844}, locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh", accept_downloads=True)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.clock.install(time=datetime(2026, 11, 9, 2, 0, tzinfo=timezone.utc))
            page.goto(BASE_URL)
            page.wait_for_load_state("networkidle")
            expect(page.get_by_role("button", name="Đã lên công ty", exact=True)).to_be_visible()
            page.get_by_role("button", name="Đã lên công ty", exact=True).click()
            expect(page.get_by_text("Đang làm việc", exact=True)).to_be_visible()
            page.clock.fast_forward(9 * 3600 * 1000)
            expect(page.locator(".timer-digits")).to_have_text("08:00:00")
            page.get_by_role("button", name="Tạm dừng", exact=True).click()
            expect(page.get_by_role("button", name="Tiếp tục làm việc", exact=True)).to_be_visible()
            page.reload()
            page.wait_for_load_state("networkidle")
            expect(page.locator(".timer-digits")).to_have_text("08:00:00")
            page.get_by_role("button", name="Tiếp tục làm việc", exact=True).click()
            page.clock.fast_forward(3600 * 1000)
            page.get_by_role("button", name="Đã rời công ty", exact=True).click()
            expect(page.locator(".timer-digits")).to_have_text("09:00:00")
            page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
            page.get_by_role("button", name="Work from home", exact=True).click()
            page.get_by_role("button", name="Đã gửi", exact=True).click()
            page.get_by_label("Ghi chú").fill("Kiểm thử bằng dữ liệu giả")
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.get_by_text("Request WFH hôm nay", exact=True)).to_be_visible()
            page.get_by_role("button", name="Đã được duyệt", exact=True).click()
            expect(page.get_by_text("Đã duyệt", exact=True)).to_be_visible()
            for width in [320, 360, 390, 430, 1280]:
                page.set_viewport_size({"width": width, "height": 900})
                page.screenshot(path=str(OUT / f"{engine}-today-{width}.png"), full_page=True)
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"Overflow {engine} {width}"
            page.set_viewport_size({"width": 390, "height": 844})
            page.get_by_role("button", name="Lịch sử", exact=True).click()
            expect(page.get_by_role("heading", name="Lịch sử làm việc")).to_be_visible()
            expect(page.locator(".history-row").filter(has_text="Work from home")).to_contain_text("09:00:00")
            page.get_by_label("Ngày cần bổ sung").fill("2026-11-06")
            page.get_by_role("button", name="Bổ sung", exact=True).click()
            page.get_by_role("button", name="Thêm ca làm việc", exact=True).click()
            page.get_by_label("Giờ vào", exact=True).fill("2026-11-06T09:00")
            page.get_by_label("Giờ về", exact=True).fill("2026-11-06T16:00")
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.locator(".history-row").filter(has_text="06").first).to_be_visible()
            page.screenshot(path=str(OUT / f"{engine}-history.png"), full_page=True)
            page.get_by_role("button", name="Báo cáo", exact=True).click()
            expect(page.locator(".report-number")).to_have_text("15:00:00")
            page.screenshot(path=str(OUT / f"{engine}-reports.png"), full_page=True)
            page.get_by_role("button", name="Cài đặt", exact=True).click()
            page.get_by_label("Tự trừ nghỉ trưa (phút/ngày)").fill("30")
            page.get_by_role("button", name="2 ngày", exact=True).click()
            page.get_by_role("button", name="Lưu cài đặt", exact=True).click()
            expect(page.get_by_label("Tự trừ nghỉ trưa (phút/ngày)")).to_have_value("30")
            with page.expect_download() as event:
                page.get_by_role("button", name="Xuất JSON", exact=True).click()
            path = OUT / f"{engine}-backup.json"
            event.value.save_as(str(path))
            backup = json.loads(path.read_text(encoding="utf-8"))
            assert len(backup["days"]) == 2
            assert backup["settings"]["lunchMinutes"] == 30
            # Import is exercised only against isolated browser data created above.
            backup["settings"]["lunchMinutes"] = 60
            fixture = OUT / f"{engine}-import.json"
            fixture.write_text(json.dumps(backup), encoding="utf-8")
            page.locator('input[type="file"]').set_input_files(str(fixture))
            expect(page.get_by_role("alertdialog")).to_be_visible()
            page.get_by_role("button", name="Thay sổ hiện tại", exact=True).click()
            expect(page.get_by_label("Tự trừ nghỉ trưa (phút/ngày)")).to_have_value("60")
            page.get_by_role("button", name="Hôm nay", exact=True).click()
            expect(page.locator(".timer-digits")).to_have_text("09:00:00")
            page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
            page.get_by_label("Ghi chú").fill("Đổi nhưng chưa lưu")
            page.get_by_role("button", name="Quay lại", exact=True).click()
            expect(page.get_by_role("alertdialog")).to_be_visible()
            page.get_by_role("button", name="Giữ lại", exact=True).click()
            expect(page.get_by_label("Ghi chú")).to_have_value("Đổi nhưng chưa lưu")
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            # axe audits visible primary screens at the narrowest supported width.
            page.set_viewport_size({"width": 320, "height": 900})
            axe = Path("node_modules/axe-core/axe.min.js").read_text(encoding="utf-8")
            for screen in ["Hôm nay", "Lịch sử", "Báo cáo"]:
                page.get_by_role("button", name=screen, exact=True).click()
                page.add_script_tag(content=axe)
                result = page.evaluate("async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
                violations = [{"id": x["id"], "nodes": [n["target"] for n in x["nodes"]]} for x in result["violations"]]
                assert not violations, f"Accessibility {engine} {screen}: {violations}"
            assert not errors, errors
            # A second tab must not erase an open draft or silently overwrite it.
            page.get_by_role("button", name="Hôm nay", exact=True).click()
            page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
            page.get_by_label("Ghi chú").fill("Giữ bản nháp khi tab khác lưu")
            other = context.new_page()
            other.clock.install(time=datetime(2026, 11, 9, 13, 0, tzinfo=timezone.utc))
            other.goto(BASE_URL)
            other.wait_for_load_state("networkidle")
            other.get_by_role("button", name="Cài đặt", exact=True).click()
            other.get_by_role("button", name="3 ngày", exact=True).click()
            other.get_by_role("button", name="Lưu cài đặt", exact=True).click()
            expect(page.get_by_label("Ghi chú")).to_have_value("Giữ bản nháp khi tab khác lưu")
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.get_by_role("alert")).to_contain_text("Sổ đã đổi ở tab khác")
            expect(page.get_by_label("Ghi chú")).to_have_value("Giữ bản nháp khi tab khác lưu")
            print(f"PASS {engine}: clock, reload, pause/resume, WFH, manual entry, reports, settings, export/import, draft, 5 viewports, axe.")
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
