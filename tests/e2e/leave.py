import json
import os
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUT = Path("output/playwright/P7")
OUT.mkdir(parents=True, exist_ok=True)
NOW = datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc)



def expand(page, title):
    trigger = page.get_by_role("button", name=title, exact=True)
    if trigger.get_attribute("aria-expanded") == "false":
        trigger.click()

def open_leave(page):
    if page.get_by_role("heading", name="Nghỉ phép", exact=True, level=1).count() == 0:
        page.get_by_role("button", name="Cài đặt", exact=True).click()
        page.get_by_role("button", name="Nghỉ phép", exact=True).click()


def check_target(page, target):
    page.get_by_role("button", name="Hôm nay", exact=True).click()
    expand(page, "Tháng 11")
    expect(page.locator(".month-overview")).to_contain_text(target)
    open_leave(page)


def saved(page):
    return page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1'))")


def open_page(context):
    page = context.new_page()
    page.clock.install(time=NOW)
    page.goto(os.environ["APP_URL"])
    page.wait_for_load_state("networkidle")
    return page


def add(panel, start, end=None, note="", succeeds=True):
    open_leave(panel.page)
    if panel.get_by_label("Từ ngày", exact=True).count() == 0:
        panel.get_by_role("button", name="Thêm ngày nghỉ phép", exact=True).click()
    panel.get_by_label("Từ ngày", exact=True).fill(start)
    panel.get_by_label("Đến ngày", exact=True).fill(end or start)
    panel.get_by_label("Ghi chú (không bắt buộc)", exact=True).fill(note)
    panel.get_by_role("button", name="Lưu ngày nghỉ phép", exact=True).click()
    if succeeds:
        expect(panel.get_by_label("Từ ngày", exact=True)).to_have_count(0)
    else:
        expect(panel.get_by_role("alert")).to_be_visible()


def edit(panel, date):
    open_leave(panel.page)
    return panel.get_by_role("button", name=f"Sửa ngày nghỉ phép {date}", exact=True)


def remove(panel, date):
    panel.get_by_role("button", name=f"Xóa ngày nghỉ phép {date}", exact=True).click()


def axe_check(page, label):
    if page.locator("[data-sonner-toast]").count():
        page.clock.run_for(6000)
        expect(page.locator("[data-sonner-toast]")).to_have_count(0)
    if not page.evaluate("typeof axe !== 'undefined'"):
        page.add_script_tag(content=Path("node_modules/axe-core/axe.min.js").read_text(encoding="utf-8"))
    violations = page.evaluate("async () => (await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v => ({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
    assert not violations, f"Accessibility {label}: {violations}"


def main():
    with sync_playwright() as p:
        for engine in ["chromium", "webkit"]:
            browser = getattr(p, engine).launch(headless=True)
            context = browser.new_context(viewport={"width": 320, "height": 900}, locale="vi-VN",
                                          timezone_id="Asia/Ho_Chi_Minh", accept_downloads=True)
            page = open_page(context)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            open_leave(page)
            panel = page.get_by_role("region", name="Nghỉ phép", exact=True)
            panel.get_by_role("button", name="Thêm ngày nghỉ phép", exact=True).click()
            expect(panel.get_by_label("Từ ngày", exact=True)).to_have_value("2026-11-10")
            expect(panel.get_by_label("Đến ngày", exact=True)).to_have_value("2026-11-10")
            axe_check(page, f"{engine}/expanded-form")
            page.screenshot(path=str(OUT / f"{engine}-leave-form-320.png"), full_page=True)
            panel.screenshot(path=str(OUT / f"{engine}-leave-panel-320.png"))
            add(panel, "2026-11-10", note="Nghỉ ngày mai")
            expect(edit(panel, "10/11/2026")).to_contain_text("Nghỉ ngày mai")
            expect(panel.get_by_label("Từ ngày", exact=True)).to_have_count(0)
            check_target(page, "160:00")
            page.reload()
            expect(edit(panel, "10/11/2026")).to_be_visible()
            assert saved(page)["days"]["2026-11-10"]["kind"] == "leave"
            page.get_by_role("button", name="Lịch sử", exact=True).click()
            expect(page.locator(".history-row").filter(has_text="Nghỉ phép")).to_have_count(1)
            page.get_by_role("button", name="Hôm nay", exact=True).click()

            add(panel, "2026-11-28", "2026-12-01", "Qua tháng, gồm cuối tuần")
            for date in ["2026-11-28", "2026-11-29", "2026-11-30", "2026-12-01"]:
                assert saved(page)["days"][date]["kind"] == "leave"
            panel.get_by_label("Chọn tháng").fill("2026-12")
            expect(edit(panel, "01/12/2026")).to_be_visible()
            panel.get_by_label("Chọn tháng").fill("2026-11")
            expect(edit(panel, "28/11/2026")).to_be_visible()
            expect(edit(panel, "29/11/2026")).to_be_visible()
            check_target(page, "152:00")
            before = saved(page)
            add(panel, "2026-11-09", "2026-11-11", "Giữ nháp khi trùng", succeeds=False)
            expect(panel.get_by_role("alert")).to_be_visible()
            expect(panel.get_by_label("Ghi chú (không bắt buộc)", exact=True)).to_have_value("Giữ nháp khi trùng")
            assert saved(page) == before
            # A successful retry collapses the error form before opening the editor.
            add(panel, "2026-11-12", note="Ngày sẽ đổi loại")
            edit(panel, "12/11/2026").click()
            page.get_by_role("button", name="Ngày lễ", exact=True).click()
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.get_by_role("button", name="Lưu ngày làm việc", exact=True)).to_have_count(0)
            expect(edit(panel, "12/11/2026")).to_have_count(0)
            page.wait_for_function("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days['2026-11-12'].kind === 'holiday'")
            assert saved(page)["days"]["2026-11-12"]["kind"] == "holiday"
            edit(panel, "10/11/2026").click()
            page.get_by_role("button", name="Làm việc", exact=True).click()
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.get_by_role("button", name="Lưu ngày làm việc", exact=True)).to_have_count(0)
            expect(edit(panel, "10/11/2026")).to_have_count(0)
            check_target(page, "152:00")
            add(panel, "2026-11-10", note="Không ghi đè ngày văn phòng", succeeds=False)
            expect(panel.get_by_role("alert")).to_be_visible()
            assert saved(page)["days"]["2026-11-10"]["kind"] == "work"
            add(panel, "2026-11-16", note="Nghỉ đã sửa")
            edit(panel, "16/11/2026").click()
            page.get_by_label("Ghi chú", exact=True).fill("Nghỉ phép đã sửa")
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.get_by_role("button", name="Lưu ngày làm việc", exact=True)).to_have_count(0)
            expect(edit(panel, "16/11/2026")).to_contain_text("Nghỉ phép đã sửa")

            page.get_by_role("button", name="Cài đặt", exact=True).click()
            page.get_by_role("button", name="Bản sao lưu", exact=True).click()
            with page.expect_download() as download:
                page.get_by_role("button", name="Xuất JSON", exact=True).click()
            backup_path = OUT / f"{engine}-leave.json"
            download.value.save_as(str(backup_path))
            backup = json.loads(backup_path.read_text(encoding="utf-8"))
            assert backup["days"]["2026-11-16"]["kind"] == "leave"
            assert backup["days"]["2026-11-16"]["note"] == "Nghỉ phép đã sửa"
            page.locator('input[type="file"]').set_input_files(str(backup_path))
            page.get_by_role("button", name="Thay sổ hiện tại", exact=True).click()
            open_leave(page)
            expect(edit(panel, "16/11/2026")).to_contain_text("Nghỉ phép đã sửa")

            remove(panel, "16/11/2026")
            expect(page.get_by_role("alertdialog")).to_contain_text("Xóa ngày nghỉ phép?")
            other = open_page(context)
            open_leave(other)
            other_panel = other.get_by_role("region", name="Nghỉ phép", exact=True)
            edit(other_panel, "16/11/2026").click()
            other.get_by_label("Ghi chú", exact=True).fill("Đổi ở tab khác")
            other.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(edit(other_panel, "16/11/2026")).to_contain_text("Đổi ở tab khác")
            expect(page.locator('.holiday-edit[aria-label="Sửa ngày nghỉ phép 16/11/2026"]')).to_contain_text("Đổi ở tab khác")
            page.get_by_role("button", name="Xóa ngày nghỉ phép", exact=True).click()
            expect(panel.get_by_role("alert")).to_contain_text("Sổ đã đổi")
            assert saved(page)["days"]["2026-11-16"]["note"] == "Đổi ở tab khác"
            other.close()
            remove(panel, "16/11/2026")
            page.get_by_role("button", name="Giữ lại", exact=True).click()
            expect(edit(panel, "16/11/2026")).to_be_visible()
            remove(panel, "16/11/2026")
            page.get_by_role("button", name="Xóa ngày nghỉ phép", exact=True).click()
            expect(edit(panel, "16/11/2026")).to_have_count(0)
            assert "2026-11-16" not in saved(page)["days"]
            check_target(page, "152:00")
            for width in [320, 390]:
                page.set_viewport_size({"width": width, "height": 900})
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                axe_check(page, f"{engine}/{width}")
                page.screenshot(path=str(OUT / f"{engine}-leave-{width}.png"), full_page=True)
            assert not errors, errors
            context.close()

            # Existing office time is preserved until replacement is confirmed.
            context = browser.new_context(viewport={"width": 320, "height": 900}, locale="vi-VN",
                                          timezone_id="Asia/Ho_Chi_Minh")
            page = open_page(context)
            page.get_by_role("button", name="Đã lên công ty", exact=True).click()
            page.clock.fast_forward(3600000)
            page.get_by_role("button", name="Đã rời công ty", exact=True).click()
            page.wait_for_function("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days['2026-11-09'].sessions.every(s => s.end !== null)")
            office = saved(page)["days"]["2026-11-09"]
            page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ", exact=True).click()
            page.get_by_role("button", name="Nghỉ phép", exact=True).click()
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            expect(page.get_by_role("alertdialog")).to_contain_text("Thay cách ghi giờ của ngày này?")
            page.get_by_role("button", name="Giữ lại", exact=True).click()
            assert saved(page)["days"]["2026-11-09"] == office
            page.get_by_role("button", name="Lưu ngày làm việc", exact=True).click()
            page.get_by_role("button", name="Thay và lưu", exact=True).click()
            expect(page.get_by_role("region", name="Ngày nghỉ hôm nay", exact=True)).to_be_visible()
            axe_check(page, f"{engine}/today-leave")
            page.screenshot(path=str(OUT / f"{engine}-today-leave-320.png"), full_page=True)
            expect(page.get_by_role("button", name="Đã lên công ty", exact=True)).to_have_count(0)
            expect(page.get_by_role("button", name="Work from home", exact=True)).to_have_count(0)
            expect(page.get_by_role("button", name="Chỉnh sửa ngày / bổ sung giờ", exact=True)).to_be_visible()
            assert saved(page)["days"]["2026-11-09"]["sessions"] == []
            assert saved(page)["days"]["2026-11-09"]["kind"] == "leave"
            expand(page, "Tuần này")
            expect(page.get_by_text("P: Nghỉ phép", exact=True)).to_be_visible()
            context.close()
            # The closed planner must refresh its untouched tomorrow default after midnight.
            context = browser.new_context(locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh")
            page = open_page(context)
            page.clock.fast_forward(6 * 3600000)
            open_leave(page)
            panel = page.get_by_role("region", name="Nghỉ phép", exact=True)
            panel.get_by_role("button", name="Thêm ngày nghỉ phép", exact=True).click()
            expect(panel.get_by_label("Từ ngày", exact=True)).to_have_value("2026-11-11")
            expect(panel.get_by_label("Đến ngày", exact=True)).to_have_value("2026-11-11")
            page.get_by_role("button", name="Quay lại Cài đặt", exact=True).click()
            expect(page.get_by_role("alertdialog")).to_have_count(0)
            expect(page.get_by_role("button", name="Bản sao lưu", exact=True)).to_be_visible()
            context.close()
            browser.close()
            print(f"PASS {engine} leave: tomorrow/reload, ranges/weekends/month boundary, conflicts, future history, edit/targets, JSON import, stale/cancel/delete, office replacement, current-day controls, axe and 320/390px.")


if __name__ == "__main__":
    main()
