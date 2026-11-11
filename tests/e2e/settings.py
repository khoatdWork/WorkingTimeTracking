import os
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUT = Path("output/playwright/P8")
OUT.mkdir(parents=True, exist_ok=True)
SECTIONS = ["Quy tắc giờ làm", "Nghỉ phép", "Ngày nghỉ lễ", "Tài khoản & đồng bộ", "Cài ứng dụng", "Bản sao lưu"]


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def back(page):
    button(page, "Quay lại Cài đặt").click()


def open_page(context):
    page = context.new_page()
    page.clock.install(time=datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc))
    page.goto(os.environ["APP_URL"])
    page.wait_for_load_state("networkidle")
    button(page, "Cài đặt").click()
    return page


def saved(page):
    return page.evaluate("JSON.parse(localStorage.getItem('du-gio.tracker.v1'))")


def audit(page, engine, name, width):
    page.set_viewport_size({"width": width, "height": 900})
    if page.locator("[data-sonner-toast]").count():
        page.clock.run_for(6000)
        expect(page.locator("[data-sonner-toast]")).to_have_count(0)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.add_script_tag(content=Path("node_modules/axe-core/axe.min.js").read_text(encoding="utf-8"))
    violations = page.evaluate("async () => (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
    assert not violations, f"{engine}/{name}/{width}: {violations}"
    page.screenshot(path=str(OUT / f"{engine}-settings-{name}-{width}.png"), full_page=True)


def main():
    with sync_playwright() as p:
        for engine in ["chromium", "webkit"]:
            browser = getattr(p, engine).launch(headless=True)
            context = browser.new_context(viewport={"width":320,"height":900},locale="vi-VN",timezone_id="Asia/Ho_Chi_Minh")
            page = open_page(context)
            expect(page.locator(".storage-label")).to_have_count(0)
            expect(page.get_by_role("status").filter(has_text="Đang mất mạng")).to_have_count(0)
            for name in SECTIONS:
                expect(button(page, name)).to_be_visible()
            expect(page.locator('input:not([type="hidden"])')).to_have_count(0)
            expect(button(page, "Xuất JSON")).to_have_count(0)
            for width in [320,390]:
                audit(page, engine, "root", width)
                for index, name in enumerate(SECTIONS):
                    button(page, name).click()
                    expect(button(page, "Quay lại Cài đặt")).to_be_visible()
                    if name == "Tài khoản & đồng bộ":
                        expect(page.get_by_text("Đang lưu trên trình duyệt này.", exact=False)).to_be_visible()
                    audit(page, engine, str(index), width)
                    back(page)
            button(page, "Nghỉ phép").click()
            button(page, "Thêm ngày nghỉ phép").click()
            page.get_by_label("Từ ngày", exact=True).fill("2026-11-20")
            page.get_by_label("Đến ngày", exact=True).fill("2026-11-21")
            button(page, "Lưu ngày nghỉ phép").click()
            expect(button(page, "Sửa ngày nghỉ phép 20/11/2026")).to_be_visible()
            button(page, "Thêm ngày nghỉ phép").click()
            expect(page.get_by_label("Từ ngày", exact=True)).to_have_value("2026-11-10")
            back(page)
            expect(page.get_by_role("alertdialog")).to_have_count(0)
            expect(button(page, "Bản sao lưu")).to_be_visible()
            button(page, "Nghỉ phép").click()
            button(page, "Thêm ngày nghỉ phép").click()
            note = page.get_by_label("Ghi chú (không bắt buộc)", exact=True)
            note.fill("Giữ nháp nghỉ phép")
            back(page)
            expect(page.get_by_role("alertdialog")).to_contain_text("Bỏ thay đổi chưa lưu?")
            button(page, "Tiếp tục chỉnh sửa").click()
            expect(note).to_have_value("Giữ nháp nghỉ phép")
            button(page, "Hôm nay").click()
            button(page, "Bỏ thay đổi").click()
            expect(button(page, "Thêm ngày nghỉ phép")).to_have_count(0)
            button(page, "Cài đặt").click()
            button(page, "Nghỉ phép").click()
            button(page, "Thêm ngày nghỉ phép").click()
            expect(note).to_have_value("")
            page.get_by_label("Từ ngày", exact=True).fill("2026-11-20")
            page.get_by_label("Đến ngày", exact=True).fill("2026-11-20")
            button(page, "Lưu ngày nghỉ phép").click()
            expect(page.get_by_role("alert").filter(has_text="20/11/2026")).to_be_visible()
            button(page, "Hủy").click()
            expect(page.get_by_role("alert").filter(has_text="20/11/2026")).to_have_count(0)
            back(page)
            button(page, "Quy tắc giờ làm").click()
            lunch = page.get_by_label("Tự trừ nghỉ trưa (phút/ngày)")
            lunch.fill("30")
            back(page)
            expect(page.get_by_role("alertdialog")).to_contain_text("Bỏ thay đổi chưa lưu?")
            button(page, "Tiếp tục chỉnh sửa").click()
            expect(lunch).to_have_value("30")
            button(page, "Lịch sử").click()
            button(page, "Bỏ thay đổi").click()
            expect(page.get_by_role("heading", name="Lịch sử làm việc", exact=True)).to_be_visible()
            button(page, "Cài đặt").click()
            expect(button(page, "Bản sao lưu")).to_be_visible()
            button(page, "Quy tắc giờ làm").click()
            expect(lunch).to_have_value("60")
            lunch.fill("45")
            other = open_page(context)
            button(other, "Quy tắc giờ làm").click()
            other.get_by_label("Tự trừ nghỉ trưa (phút/ngày)").fill("30")
            button(other, "Lưu cài đặt").click()
            other.wait_for_function("JSON.parse(localStorage.getItem('du-gio.tracker.v1')).settings.lunchMinutes === 30")
            expect(lunch).to_have_value("45")
            button(page, "Lưu cài đặt").click()
            expect(page.get_by_text("Cài đặt đã đổi ở tab khác.", exact=False)).to_be_visible()
            expect(lunch).to_have_value("45")
            assert saved(page)["settings"]["lunchMinutes"] == 30
            other.close()
            back(page)
            button(page, "Bỏ thay đổi").click()
            button(page, "Ngày nghỉ lễ").click()
            page.get_by_label("Từ ngày", exact=True).fill("2026-12-01")
            page.get_by_label("Đến ngày", exact=True).fill("2026-12-01")
            button(page, "Thêm ngày nghỉ lễ").click()
            row = button(page, "Sửa ngày lễ 01/12/2026")
            expect(row).to_be_visible()
            row.click()
            page.get_by_label("Ghi chú", exact=True).fill("Giữ tháng và trang lễ")
            button(page, "Lưu ngày làm việc").click()
            expect(row).to_contain_text("Giữ tháng và trang lễ")
            expect(page.get_by_label("Chọn tháng")).to_have_value("2026-12")
            expect(button(page, "Quay lại Cài đặt")).to_be_visible()
            back(page)
            button(page, "Bản sao lưu").click()
            before = saved(page)
            button(page, "Xóa toàn bộ sổ hiện tại").click()
            expect(page.get_by_role("alertdialog")).to_contain_text("Xóa toàn bộ sổ hiện tại?")
            button(page, "Hủy").click()
            assert saved(page) == before
            button(page, "Xóa toàn bộ sổ hiện tại").click()
            button(page, "Xóa toàn bộ").click()
            page.wait_for_function("Object.keys(JSON.parse(localStorage.getItem('du-gio.tracker.v1')).days).length === 0")
            expect(button(page, "Xuất JSON")).to_be_visible()
            context.close()
            browser.close()
            print(f"PASS {engine} settings: root/list/subsections/back/tabs, draft discard/cancel/stale protection, holiday editor/month, backup reset, axe and 320/390px.")


if __name__ == "__main__":
    main()
