import json
import os
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUT = Path('output/playwright/P10')
OUT.mkdir(parents=True, exist_ok=True)


def button(page, name):
    return page.get_by_role('button', name=name, exact=True)


def audit(page, engine, name, width):
    page.set_viewport_size({'width':width,'height':844})
    if page.locator('[data-sonner-toast]').count():
        page.clock.run_for(6500)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    rows = page.locator('.today-detail-trigger[aria-expanded="false"]').evaluate_all("""elements => elements.map(el => {
        const box=el.getBoundingClientRect(), group=el.parentElement.getBoundingClientRect();
        return {name:el.getAttribute('aria-label'), x:box.x, y:box.y, width:box.width, height:box.height, groupWidth:group.width};
    })""")
    for row in rows:
        assert row['height'] >= 64, row
        assert abs(row['width'] - row['groupWidth']) <= 2, row
    ordered = sorted(rows, key=lambda row: row['y'])
    for previous, current in zip(ordered, ordered[1:]):
        assert previous['y'] + previous['height'] <= current['y'] + 1, (previous, current)
    page.add_script_tag(content=Path('node_modules/axe-core/axe.min.js').read_text(encoding='utf-8'))
    violations=page.evaluate("async () => (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
    assert not violations,violations
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path=str(OUT/f'{engine}-{name}-{width}-viewport.png'))
    page.screenshot(path=str(OUT/f'{engine}-{name}-{width}-full.png'),full_page=True)
    height=page.evaluate('document.documentElement.scrollHeight')
    print(f'{engine} {name} {width}: scrollHeight={height}, triggers={rows}', flush=True)
    return height


def main():
    with sync_playwright() as p:
        for engine in ['chromium','webkit']:
            browser=getattr(p,engine).launch(headless=True)
            context=browser.new_context(viewport={'width':320,'height':844},locale='vi-VN',timezone_id='Asia/Ho_Chi_Minh')
            page=context.new_page()
            page.clock.install(time=datetime(2026,11,9,2,0,tzinfo=timezone.utc))
            page.goto(os.environ['APP_URL']);page.wait_for_load_state('networkidle')
            for name in ['Tuần này','Tháng 11']:
                expect(button(page,name)).to_have_attribute('aria-expanded','false')
            expect(page.get_by_role('region',name='Nghỉ phép',exact=True)).to_have_count(0)
            expect(button(page,'Đã lên công ty')).to_be_visible()
            heights={}
            for width in [320,390]:
                heights[width]=audit(page,engine,'office-empty',width)
                # Baseline P9 office page measured 1739/1766px at these widths.
                assert heights[width] < 1300,heights
            button(page,'Tuần này').focus();button(page,'Tuần này').press('Enter')
            expect(page.locator('.week-ledger')).to_be_visible()
            button(page,'Tuần này').press('Space')
            expect(page.locator('.week-ledger')).not_to_be_visible()
            button(page,'Tháng 11').click()
            expect(page.locator('.month-overview')).to_be_visible()
            button(page,'Tháng 11').click()
            expect(button(page,'Nghỉ phép')).to_have_count(0)
            expect(button(page,'Thêm ngày nghỉ phép')).to_have_count(0)
            button(page,'Work from home').click();button(page,'8 giờ').click()
            expect(button(page,'Request WFH hôm nay')).to_have_attribute('aria-expanded','false')
            button(page,'Request WFH hôm nay').click()
            button(page,'Đã gửi request').click()
            expect(button(page,'Đã gửi request')).to_have_attribute('aria-pressed','true')
            button(page,'Request WFH hôm nay').click()
            for width in [320,390]:audit(page,engine,'wfh',width)
            page.reload();page.clock.run_for(1000)
            expect(page.locator('.timer-digits')).to_have_text('08:00:00')
            button(page,'Request WFH hôm nay').click()
            expect(button(page,'Đã gửi request')).to_have_attribute('aria-pressed','true')
            context.close()

            context=browser.new_context(viewport={'width':320,'height':844},locale='vi-VN',timezone_id='Asia/Ho_Chi_Minh')
            page=context.new_page();page.clock.install(time=datetime(2026,11,9,2,0,tzinfo=timezone.utc))
            page.goto(os.environ['APP_URL']);page.wait_for_load_state('networkidle')
            button(page,'Đã lên công ty').click();page.clock.fast_forward(3*3600000)
            expect(button(page,'Các ca hôm nay')).to_have_attribute('aria-expanded','false')
            button(page,'Các ca hôm nay').click()
            expect(page.locator('.session-row')).to_have_count(1)
            button(page,'Các ca hôm nay').click()
            for width in [320,390]:audit(page,engine,'office-running',width)
            context.close()

            # A leave day entered through Settings replaces work controls immediately and after reload.
            context=browser.new_context(viewport={'width':320,'height':844},locale='vi-VN',timezone_id='Asia/Ho_Chi_Minh')
            page=context.new_page();page.clock.install(time=datetime(2026,11,9,2,0,tzinfo=timezone.utc))
            page.goto(os.environ['APP_URL']);page.wait_for_load_state('networkidle')
            button(page,'Cài đặt').click();button(page,'Nghỉ phép').click()
            button(page,'Thêm ngày nghỉ phép').click()
            page.get_by_label('Từ ngày',exact=True).fill('2026-11-09')
            page.get_by_label('Đến ngày',exact=True).fill('2026-11-09')
            page.get_by_label('Ghi chú (không bắt buộc)',exact=True).fill('Nghỉ việc gia đình hôm nay')
            button(page,'Lưu ngày nghỉ phép').click()
            expect(button(page,'Sửa ngày nghỉ phép 09/11/2026')).to_be_visible()
            button(page,'Hôm nay').click()
            for reload in [False,True]:
                if reload:
                    page.reload();page.clock.run_for(1000)
                rest=page.get_by_role('region',name='Ngày nghỉ hôm nay',exact=True)
                expect(rest.get_by_role('heading',name='Hôm nay bạn nghỉ phép',exact=True)).to_be_visible()
                expect(rest).to_contain_text('Nghỉ việc gia đình hôm nay')
                expect(button(page,'Đã lên công ty')).to_have_count(0)
                expect(button(page,'Work from home')).to_have_count(0)
                expect(button(page,'Chỉnh sửa ngày / bổ sung giờ')).to_be_visible()
                heading=rest.get_by_role('heading',name='Hôm nay bạn nghỉ phép',exact=True)
                assert heading.evaluate('el => parseFloat(getComputedStyle(el).fontSize)') >= 24
            for width in [320,390]:audit(page,engine,'leave-today',width)
            context.close()

            # Leave today must still expose stopping a prior-day active session.
            state={'schema':1,'version':0,'settings':{'dailyMinutes':480,'lunchMinutes':60,'wfhLimit':3},'days':{
                '2026-11-08':{'date':'2026-11-08','kind':'work','mode':'office','request':'none','note':'','sessions':[{'start':1794142800000,'end':None}]},
                '2026-11-09':{'date':'2026-11-09','kind':'leave','mode':'office','request':'none','note':'Nghỉ hôm nay','sessions':[]}}}
            context=browser.new_context(viewport={'width':320,'height':844},locale='vi-VN',timezone_id='Asia/Ho_Chi_Minh')
            context.add_init_script(f"if (!localStorage.getItem('du-gio.tracker.v1')) localStorage.setItem('du-gio.tracker.v1',{json.dumps(json.dumps(state))});")
            page=context.new_page();page.clock.install(time=datetime(2026,11,9,2,0,tzinfo=timezone.utc))
            page.goto(os.environ['APP_URL']);page.wait_for_load_state('networkidle')
            expect(page.get_by_role('region',name='Ngày nghỉ hôm nay',exact=True)).to_be_visible()
            expect(page.get_by_role('heading',name='Hôm nay bạn nghỉ phép',exact=True)).to_be_visible()
            expect(page.get_by_text('Nghỉ hôm nay',exact=True)).to_be_visible()
            button(page,'Tuần này').click()
            expect(page.get_by_text('P: Nghỉ phép',exact=True)).to_be_visible()
            button(page,'Tuần này').click()
            expect(page.locator('.status-pill')).to_have_text('Nghỉ phép')
            expect(page.locator('.status-pill.is-working')).to_have_count(0)
            for width in [320,390]:audit(page,engine,'leave-prior-session-active',width)
            button(page,'Kết thúc ca đang chạy').click()
            expect(button(page,'Kết thúc ca đang chạy')).to_have_count(0)
            expect(button(page,'Chỉnh sửa ngày / bổ sung giờ')).to_be_visible()
            audit(page,engine,'leave-prior-session',320)
            context.close();browser.close()
            print(f'PASS {engine} Today compact: closed defaults, keyboard/details, leave management absent, WFH request/reload, sessions, prior-day active leave, axe320390; office heights {heights}')


if __name__=='__main__':
    main()
