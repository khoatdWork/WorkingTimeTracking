import json
import os
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ["APP_URL"]
OUT = Path("output/playwright/P4")
OUT.mkdir(parents=True, exist_ok=True)



def expand(page, title):
    trigger = page.get_by_role("button", name=title, exact=True)
    if trigger.get_attribute("aria-expanded") == "false":
        trigger.click()

def main():
    with sync_playwright() as p:
        for engine in ["chromium", "webkit"]:
            browser = getattr(p, engine).launch(headless=True)
            context = browser.new_context(viewport={"width": 320, "height": 900}, locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh")
            page = context.new_page()
            page.clock.install(time=datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc))
            page.goto(BASE_URL)
            page.wait_for_load_state("networkidle")
            page.get_by_role("button", name="Work from home", exact=True).click()
            expect(page.get_by_text("Chưa chọn giờ", exact=True)).to_be_visible()
            expect(page.get_by_role("button", name="Bắt đầu WFH", exact=True)).to_have_count(0)
            expect(page.locator(".timer-digits")).to_have_text("00:00:00")
            page.get_by_role("button", name="8 giờ", exact=True).click()
            expect(page.locator(".timer-digits")).to_have_text("08:00:00")
            expand(page, "Request WFH hôm nay")
            page.get_by_role("button", name="Đã gửi request", exact=True).click()
            context.set_offline(True)
            page.get_by_role("button", name="10 giờ", exact=True).click()
            expect(page.locator(".timer-digits")).to_have_text("10:00:00")
            expect(page.locator(".daily-balance")).to_contain_text("Dư 2 giờ")
            expand(page, "Tuần này")
            expect(page.locator(".week-ledger")).to_contain_text("10:00:00")
            assert page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days['2026-11-09'].sessions") == []
            context.set_offline(False)
            page.reload()
            expect(page.locator(".timer-digits")).to_have_text("10:00:00")
            expand(page, "Request WFH hôm nay")
            expect(page.get_by_role("button", name="Đã gửi request", exact=True)).to_have_attribute("aria-pressed", "true")
            page.screenshot(path=str(OUT / f"{engine}-wfh-320.png"), full_page=True)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            # A future WFH request can be planned, but cannot credit future work.
            page.get_by_role("button", name="Lịch sử", exact=True).click()
            page.get_by_label("Ngày cần bổ sung").fill("2026-11-10")
            page.get_by_role("button", name="Bổ sung", exact=True).click()
            page.get_by_role("button", name="Work from home", exact=True).click()
            expect(page.get_by_role("button", name="8 giờ", exact=True)).to_be_disabled()
            page.get_by_role("button", name="Đã gửi", exact=True).click()
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            page.get_by_role("button", name="Báo cáo", exact=True).click()
            expect(page.locator(".report-number")).to_have_text("10:00:00")
            page.get_by_role("button", name="Hôm nay", exact=True).click()
            page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
            page.get_by_role("button", name="Ngày lễ", exact=True).click()
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            page.get_by_role("button", name="Giữ lại", exact=True).click()
            assert page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days['2026-11-09'].wfhHours") == 10
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            page.get_by_role("button", name="Thay và lưu", exact=True).click()
            expect(page.get_by_role("region", name="Ngày nghỉ hôm nay", exact=True)).to_contain_text("Hôm nay là ngày nghỉ lễ")
            expect(page.locator(".timer-digits")).to_have_count(0)
            expect(page.get_by_role("button", name="Work from home", exact=True)).to_have_count(0)
            expect(page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ", exact=True)).to_be_visible()
            assert "wfhHours" not in page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days['2026-11-09']")
            context.close()
            # Old WFH sessions remain exact when editing only note/request.
            legacy = {"schema": 1, "version": 0, "settings": {"dailyMinutes": 480, "lunchMinutes": 60, "wfhLimit": 3}, "days": {
                "2026-11-09": {"date": "2026-11-09", "mode": "wfh", "request": "none", "kind": "work", "note": "", "sessions": [{"start": 1794189600000, "end": 1794222000000}]}
            }}
            context = browser.new_context(locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh")
            context.add_init_script(f"if (!localStorage.getItem('du-gio.tracker.v1')) localStorage.setItem('du-gio.tracker.v1', {json.dumps(json.dumps(legacy))});")
            page = context.new_page()
            page.clock.install(time=datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc))
            page.goto(BASE_URL)
            expect(page.locator(".timer-digits")).to_have_text("08:00:00")
            page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ").click()
            page.get_by_label("Ghi chú").fill("Giữ giờ WFH cũ")
            page.get_by_role("button", name="Đã gửi", exact=True).click()
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.locator(".timer-digits")).to_have_text("08:00:00")
            saved = page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days['2026-11-09']")
            assert saved["sessions"] == legacy["days"]["2026-11-09"]["sessions"]
            assert "wfhHours" not in saved and saved["request"] == "sent"
            context.close()
            browser.close()
            print(f"PASS {engine} WFH: explicit8/10, exact net totals/reload/request, no timer, future planning, legacy sessions retained.")


if __name__ == "__main__":
    main()
