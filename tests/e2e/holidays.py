import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUT = Path("output/playwright/P6")
OUT.mkdir(parents=True, exist_ok=True)


def saved(page):
    return page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1'))")


def check_navigation(page, current):
    nav = page.locator(".bottom-nav")
    expect(nav.get_by_role("button")).to_have_text(["Hôm nay", "Lịch sử", "Báo cáo", "Cài đặt"])
    expect(page.get_by_role("button", name="Cài đặt", exact=True)).to_have_count(1)
    expect(nav.locator('[aria-current="page"]')).to_have_text(current)
    assert nav.evaluate("el => el.scrollWidth <= el.clientWidth")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")


def range_scenario(browser, engine):
    context = browser.new_context(viewport={"width": 320, "height": 900}, locale="vi-VN",
                                  timezone_id="Asia/Ho_Chi_Minh")
    page = context.new_page()
    page.clock.install(time=datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc))
    page.goto(os.environ["APP_URL"])
    page.wait_for_load_state("networkidle")
    check_navigation(page, "Hôm nay")
    settings = page.get_by_role("button", name="Cài đặt", exact=True)
    settings.focus()
    expect(settings).to_be_focused()
    settings.press("Enter")
    page.get_by_role("button", name="Ngày nghỉ lễ", exact=True).click()
    check_navigation(page, "Cài đặt")
    panel = page.get_by_role("region", name="Ngày nghỉ lễ", exact=True)

    def add_range(start, end, note):
        panel.get_by_label("Từ ngày", exact=True).fill(start)
        panel.get_by_label("Đến ngày", exact=True).fill(end)
        panel.get_by_label("Tên ngày lễ (không bắt buộc)").fill(note)
        panel.get_by_role("button", name="Thêm ngày nghỉ lễ", exact=True).click()

    add_range("2026-11-13", "2026-11-16", "Kỳ nghỉ bốn ngày")
    expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_be_visible()
    days = saved(page)["days"]
    assert set(days) == {"2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"}
    assert all(day["kind"] == "holiday" and day["note"] == "Kỳ nghỉ bốn ngày" for day in days.values())
    page.get_by_role("button", name="Hôm nay", exact=True).click()
    expect(page.locator(".month-overview")).to_contain_text("152:00")
    check_navigation(page, "Hôm nay")
    page.reload()
    page.wait_for_load_state("networkidle")
    expect(page.locator(".month-overview")).to_contain_text("152:00")
    settings.click()
    page.get_by_role("button", name="Ngày nghỉ lễ", exact=True).click()
    check_navigation(page, "Cài đặt")
    before = saved(page)
    # Free edges must not be written when an occupied date lies inside the range.
    add_range("2026-11-12", "2026-11-17", "Giữ nguyên bản nháp")
    expect(panel.get_by_role("alert")).to_be_visible()
    expect(panel.get_by_label("Từ ngày", exact=True)).to_have_value("2026-11-12")
    expect(panel.get_by_label("Đến ngày", exact=True)).to_have_value("2026-11-17")
    expect(panel.get_by_label("Tên ngày lễ (không bắt buộc)")).to_have_value("Giữ nguyên bản nháp")
    assert saved(page) == before

    add_range("2026-12-31", "2027-01-02", "Qua năm mới")
    expect(panel.get_by_role("button", name="Sửa ngày lễ 31/12/2026")).to_be_visible()
    for date in ["2026-12-31", "2027-01-01", "2027-01-02"]:
        assert saved(page)["days"][date]["note"] == "Qua năm mới"
    panel.get_by_label("Chọn tháng").fill("2027-01")
    expect(panel.get_by_role("button", name="Sửa ngày lễ 01/01/2027")).to_be_visible()
    expect(panel.get_by_role("button", name="Sửa ngày lễ 02/01/2027")).to_be_visible()
    check_navigation(page, "Cài đặt")
    page.screenshot(path=str(OUT / f"{engine}-holiday-range-320.png"), full_page=True)
    context.close()


def main():
    with sync_playwright() as p:
        for engine in ["chromium", "webkit"]:
            browser = getattr(p, engine).launch(headless=True)
            context = browser.new_context(viewport={"width": 320, "height": 900}, locale="vi-VN",
                                          timezone_id="Asia/Ho_Chi_Minh", accept_downloads=True)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.clock.install(time=datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc))
            page.goto(os.environ["APP_URL"])
            page.wait_for_load_state("networkidle")
            check_navigation(page, "Hôm nay")
            # Create real work through the UI before trying to replace it with a holiday.
            page.get_by_role("button", name="Work from home", exact=True).click()
            page.get_by_role("button", name="8 giờ", exact=True).click()
            expect(page.locator(".timer-digits")).to_have_text("08:00:00")
            work = saved(page)["days"]["2026-11-09"]
            expect(page.locator(".month-overview")).to_contain_text("168:00")
            page.get_by_role("button", name="Cài đặt", exact=True).click()
            page.get_by_role("button", name="Ngày nghỉ lễ", exact=True).click()
            check_navigation(page, "Cài đặt")
            panel = page.get_by_role("region", name="Ngày nghỉ lễ", exact=True)

            def add(date, note):
                panel.get_by_label("Từ ngày", exact=True).fill(date)
                panel.get_by_label("Đến ngày", exact=True).fill(date)
                panel.get_by_label("Tên ngày lễ (không bắt buộc)").fill(note)
                panel.get_by_role("button", name="Thêm ngày nghỉ lễ", exact=True).click()

            add("2026-11-16", "Lễ tương lai, có ghi chú")
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_contain_text("Lễ tương lai, có ghi chú")
            add("2026-11-14", "Lễ cuối tuần")
            page.get_by_role("button", name="Hôm nay", exact=True).click()
            expect(page.locator(".month-overview")).to_contain_text("160:00")
            page.reload()
            page.wait_for_load_state("networkidle")
            expect(page.locator(".month-overview")).to_contain_text("160:00")
            page.get_by_role("button", name="Cài đặt", exact=True).click()
            page.get_by_role("button", name="Ngày nghỉ lễ", exact=True).click()
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_be_visible()
            for date in ["2026-11-16", "2026-11-09"]:
                before = saved(page)["days"]
                add(date, "Giữ nội dung nhập khi lỗi")
                expect(panel.get_by_role("alert")).to_contain_text("Chỉnh sửa ngày")
                expect(panel.get_by_label("Tên ngày lễ (không bắt buộc)")).to_have_value("Giữ nội dung nhập khi lỗi")
                expect(panel.get_by_label("Từ ngày", exact=True)).to_have_value(date)
                expect(panel.get_by_label("Đến ngày", exact=True)).to_have_value(date)
                assert saved(page)["days"] == before
            assert saved(page)["days"]["2026-11-09"] == work
            panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026").click()
            page.get_by_role("button", name="Bỏ thay đổi", exact=True).click()
            expect(page.get_by_role("button", name="Ngày lễ", exact=True)).to_have_attribute("aria-pressed", "true")
            page.get_by_label("Ghi chú", exact=True).fill("Lễ đã sửa")
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_contain_text("Lễ đã sửa")

            page.get_by_role("button", name="Quay lại Cài đặt", exact=True).click()
            page.get_by_role("button", name="Bản sao lưu", exact=True).click()
            # JSON is the supported import format; CSV preserves holiday type and note for spreadsheets.
            with page.expect_download() as download:
                page.get_by_role("button", name="Xuất JSON", exact=True).click()
            backup_path = OUT / f"{engine}-holidays.json"
            download.value.save_as(str(backup_path))
            backup = json.loads(backup_path.read_text(encoding="utf-8"))
            assert backup["days"]["2026-11-16"]["kind"] == "holiday"
            assert backup["days"]["2026-11-16"]["note"] == "Lễ đã sửa"
            with page.expect_download() as download:
                page.get_by_role("button", name="Xuất CSV", exact=True).click()
            csv_path = OUT / f"{engine}-holidays.csv"
            download.value.save_as(str(csv_path))
            with csv_path.open(encoding="utf-8-sig", newline="") as handle:
                rows = list(csv.DictReader(handle))
            holiday = next(row for row in rows if row["Ngày"] == "2026-11-16")
            assert holiday["Loại ngày"] == "holiday" and holiday["Ghi chú"] == "Lễ đã sửa"
            page.locator('input[type="file"]').set_input_files(str(backup_path))
            page.get_by_role("button", name="Thay sổ hiện tại", exact=True).click()
            page.get_by_role("button", name="Quay lại Cài đặt", exact=True).click()
            page.get_by_role("button", name="Ngày nghỉ lễ", exact=True).click()
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_contain_text("Lễ đã sửa")

            add("2026-12-01", "Lễ tháng sau")
            expect(panel.get_by_role("button", name="Sửa ngày lễ 01/12/2026")).to_be_visible()
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_have_count(0)
            panel.get_by_role("button", name="Sửa ngày lễ 01/12/2026").click()
            page.get_by_label("Ghi chú", exact=True).fill("Lễ tháng sau đã sửa")
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(panel.get_by_label("Chọn tháng")).to_have_value("2026-12")
            expect(panel.get_by_role("button", name="Sửa ngày lễ 01/12/2026")).to_contain_text("Lễ tháng sau đã sửa")
            panel.get_by_label("Chọn tháng").fill("2026-11")
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_be_visible()
            expect(panel.get_by_role("button", name="Thêm ngày nghỉ lễ", exact=True)).to_be_enabled()
            panel.get_by_role("button", name="Thêm ngày nghỉ lễ", exact=True).hover()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            page.add_script_tag(content=Path("node_modules/axe-core/axe.min.js").read_text(encoding="utf-8"))
            violations = page.evaluate("async () => (await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v => ({id:v.id, nodes:v.nodes.map(n => n.target)}))")
            assert not violations, f"Accessibility {engine}: {violations}"
            page.screenshot(path=str(OUT / f"{engine}-holidays-320.png"), full_page=True)
            # Confirmations must not delete a holiday changed in a second tab.
            panel.get_by_role("button", name="Xóa ngày lễ 16/11/2026").click()
            other = context.new_page()
            other.clock.install(time=datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc))
            other.goto(os.environ["APP_URL"])
            other.wait_for_load_state("networkidle")
            other.get_by_role("button", name="Cài đặt", exact=True).click()
            other.get_by_role("button", name="Ngày nghỉ lễ", exact=True).click()
            other.get_by_role("button", name="Sửa ngày lễ 16/11/2026").click()
            other.get_by_label("Ghi chú", exact=True).fill("Lễ đổi ở tab khác")
            other.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(other.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_contain_text("Lễ đổi ở tab khác")
            expect(page.locator('.holiday-edit[aria-label="Sửa ngày lễ 16/11/2026"]')).to_contain_text("Lễ đổi ở tab khác")
            page.get_by_role("button", name="Xóa ngày lễ", exact=True).click()
            expect(panel.get_by_role("alert")).to_contain_text("Sổ đã đổi")
            assert saved(page)["days"]["2026-11-16"]["note"] == "Lễ đổi ở tab khác"
            other.close()
            panel.get_by_role("button", name="Xóa ngày lễ 16/11/2026").click()
            page.get_by_role("button", name="Giữ lại", exact=True).click()
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_be_visible()
            panel.get_by_role("button", name="Xóa ngày lễ 16/11/2026").click()
            page.get_by_role("button", name="Xóa ngày lễ", exact=True).click()
            expect(panel.get_by_role("button", name="Sửa ngày lễ 16/11/2026")).to_have_count(0)
            assert "2026-11-16" not in saved(page)["days"]
            page.get_by_role("button", name="Hôm nay", exact=True).click()
            expect(page.locator(".month-overview")).to_contain_text("168:00")
            assert saved(page)["days"]["2026-11-09"] == work
            assert not errors, errors
            context.close()
            range_scenario(browser, engine)
            browser.close()
            print(f"PASS {engine} holidays: inclusive ranges, atomic conflict rejection, year boundary, four-tab keyboard navigation, future/weekend targets, persistence, duplicate/work protection, edit, JSON roundtrip/CSV, months, stale/cancel/confirmed removal, 320px and hovered-button axe.")


if __name__ == "__main__":
    main()
