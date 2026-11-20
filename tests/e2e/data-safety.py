"""Actual persistence/auth/sync/UI with fixture transport; never writes a real project."""
import json
from copy import deepcopy
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = 'http://127.0.0.1:3101/tests/e2e/sync-fixture.html'
KEY = 'du-gio.tracker.v1'
EMPTY = {'schema':1,'version':0,'settings':{'dailyMinutes':480,'lunchMinutes':60,'wfhLimit':3},'days':{}}
DAY = {'date':'2026-11-02','kind':'work','mode':'wfh','request':'sent','sessions':[],'wfhHours':8,'note':'server original'}
ARTIFACTS = Path('output/playwright/P12')
ARTIFACTS.mkdir(parents=True, exist_ok=True)

def main():
    with sync_playwright() as p:
        for engine in ['chromium','webkit']:
            browser = getattr(p, engine).launch(headless=True)
            remote = {'a':{**deepcopy(EMPTY),'version':46,'days':{DAY['date']:deepcopy(DAY)}}}
            writes = []
            def cloud(route):
                uid = route.request.url.rsplit('/',1)[-1]
                if route.request.method == 'POST':
                    remote[uid] = json.loads(route.request.post_data)
                    writes.append(deepcopy(remote[uid]))
                route.fulfill(content_type='application/json',body=json.dumps(remote.get(uid)))

            # Auth disappears: retain the account ledger across reload; edits stay scoped to it.
            context = browser.new_context(service_workers='block')
            context.route('**/fixture-cloud/*',cloud)
            page = context.new_page()
            errors = []
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(URL)
            page.evaluate("localStorage.setItem('fixture-user','a'); window.dispatchEvent(new Event('fixture-auth'))")
            expect(page.locator('#owner')).to_have_text('a')
            page.wait_for_function("JSON.parse(document.querySelector('#state').textContent)?.days['2026-11-02']?.wfhHours === 8")
            page.evaluate("localStorage.removeItem('fixture-user'); window.dispatchEvent(new Event('fixture-auth'))")
            expect(page.locator('#user')).to_have_text('guest')
            expect(page.locator('#owner')).to_have_text('a')
            page.get_by_role('button',name='Lưu 10 giờ',exact=True).click()
            expect(page.locator('#pending')).to_have_text('true')
            assert writes == []
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].wfhHours") == 10
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}'))?.days ?? {{}}") == {}
            page.reload()
            expect(page.locator('#owner')).to_have_text('a')
            expect(page.locator('#pending')).to_have_text('true')
            page.evaluate("localStorage.setItem('fixture-user','a'); window.dispatchEvent(new Event('fixture-auth'))")
            expect(page.locator('#pending')).to_have_text('false')
            assert remote['a']['days'][DAY['date']]['wfhHours'] == 10
            page.evaluate("window.dispatchEvent(new Event('fixture-auth-error'))")
            expect(page.locator('#error')).to_contain_text('Chưa chuyển sang sổ khác')
            expect(page.locator('#owner')).to_have_text('a')
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].wfhHours") == 10
            page.evaluate("window.dispatchEvent(new Event('fixture-auth'))")
            expect(page.locator('#error')).to_have_text('')
            page.get_by_role('button',name='Đăng xuất',exact=True).click()
            expect(page.locator('#owner')).to_have_text('guest')
            page.reload()
            expect(page.locator('#owner')).to_have_text('guest')
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].wfhHours") == 10
            context.close()

            # Legacy account without a remembered-owner marker must not silently open a guest book.
            context = browser.new_context(service_workers='block')
            context.route('**/fixture-cloud/*',cloud)
            old = {'state':deepcopy(remote['a']),'cloudVersion':remote['a']['version'],'dirty':False}
            context.add_init_script(f"localStorage.setItem('{KEY}:a',{json.dumps(json.dumps(old))});")
            page = context.new_page()
            page.set_viewport_size({'width':320,'height':900})
            page.goto(URL+'?ui')
            expect(page.get_by_text('Cần đăng nhập lại Google.',exact=False)).to_be_visible()
            page.get_by_role('button',name='Mở tài khoản',exact=True).click()
            expect(page.get_by_text('Sổ tài khoản trên thiết bị',exact=True)).to_be_visible()
            expect(page.get_by_role('button',name='Đăng nhập với Google',exact=True)).to_be_visible()
            assert page.evaluate(f"localStorage.getItem('{KEY}')") is None
            page.screenshot(path=str(ARTIFACTS/f'{engine}-expired-session-320.png'),full_page=True)
            context.close()

            # Synchronous initialization failures must show a recoverable error, not a new guest ledger.
            context = browser.new_context(service_workers='block')
            context.add_init_script(f"localStorage.setItem('fixture-init-error','true');localStorage.setItem('{KEY}:a',{json.dumps(json.dumps(old))});")
            page = context.new_page()
            page.goto(URL+'?ui')
            expect(page.get_by_role('heading',name='Chưa mở được sổ',exact=True)).to_be_visible()
            expect(page.get_by_text('Không khôi phục được phiên Google.',exact=False)).to_be_visible()
            assert page.evaluate(f"localStorage.getItem('{KEY}')") is None
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].wfhHours") == 10
            context.close()

            # Unknown conflicting guest data cannot overwrite the server; recovery is explicit.
            context = browser.new_context(service_workers='block',accept_downloads=True)
            context.route('**/fixture-cloud/*',cloud)
            local = {**deepcopy(EMPTY),'version':3,'days':{DAY['date']:{**deepcopy(DAY),'wfhHours':8,'note':'local different'}}}
            context.add_init_script(f"if (!localStorage.getItem('{KEY}:a')) {{localStorage.setItem('fixture-user','a');localStorage.setItem('{KEY}',{json.dumps(json.dumps(local))});}}")
            page = context.new_page()
            page.set_viewport_size({'width':320,'height':900})
            page.goto(URL+'?ui')
            expect(page.get_by_text('Đồng bộ đã dừng để bảo vệ hai bản dữ liệu.',exact=False)).to_be_visible()
            count = len(writes)
            page.get_by_role('button',name='Đối chiếu dữ liệu',exact=True).click()
            expect(page.get_by_role('button',name='Xuất bản thiết bị',exact=True)).to_be_visible()
            expect(page.get_by_role('button',name='Xuất bản Firebase',exact=True)).to_be_visible()
            with page.expect_download() as download:
                page.get_by_role('button',name='Xuất bản Firebase',exact=True).click()
            downloaded = json.loads(Path(download.value.path()).read_text(encoding='utf-8'))
            assert downloaded == remote['a']
            page.get_by_role('button',name='Thử đồng bộ lại',exact=True).click()
            expect(page.get_by_role('button',name='Thử đồng bộ lại',exact=True)).to_be_enabled()
            assert len(writes) == count
            page.reload()
            expect(page.get_by_text('Đồng bộ đã dừng để bảo vệ hai bản dữ liệu.',exact=False)).to_be_visible()
            page.get_by_role('button',name='Đối chiếu dữ liệu',exact=True).click()
            page.get_by_role('button',name='Chọn bản Firebase',exact=True).click()
            expect(page.get_by_role('alertdialog')).to_be_visible()
            page.get_by_role('button',name='Tiếp tục đối chiếu',exact=True).click()
            assert len(writes) == count
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].note") == 'local different'
            page.screenshot(path=str(ARTIFACTS/f'{engine}-conflict-320.png'),full_page=True)
            page.get_by_role('button',name='Chọn bản Firebase',exact=True).click()
            page.get_by_role('button',name='Dùng bản đã chọn',exact=True).click()
            expect(page.get_by_role('alertdialog')).to_have_count(0)
            expect(page.get_by_text('Đã lưu local · Đã đồng bộ Firebase',exact=True)).to_be_visible()
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a')).state.days['2026-11-02'].note") == 'server original'
            history = page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:a.history'))")
            assert any(r['state']['days'].get(DAY['date'],{}).get('note') == 'local different' for r in history)
            page.get_by_role('button',name='Quay lại Cài đặt',exact=True).click()
            page.get_by_role('button',name='Bản sao lưu',exact=True).click()
            expect(page.get_by_role('heading',name='Bản phục hồi tự động',exact=True)).to_be_visible()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=str(ARTIFACTS/f'{engine}-recovery-320.png'),full_page=True)
            # Import consent applies only to the owner/version that opened the dialog.
            imported = deepcopy(local)
            imported['days'][DAY['date']]['note'] = 'must not reach another account'
            candidate = ARTIFACTS/f'{engine}-candidate.json'
            candidate.write_text(json.dumps(imported),encoding='utf-8')
            page.locator('input[type="file"]').set_input_files(str(candidate.resolve()))
            expect(page.get_by_role('alertdialog')).to_be_visible()
            page.evaluate("localStorage.setItem('fixture-user','b');window.dispatchEvent(new Event('fixture-auth'))")
            page.wait_for_function("JSON.parse(localStorage.getItem('du-gio.account.v1'))?.uid === 'b'")
            page.get_by_role('button',name='Thay sổ hiện tại',exact=True).click()
            expect(page.get_by_text('Tài khoản hoặc dữ liệu đã đổi từ lúc mở xác nhận.',exact=False)).to_be_visible()
            assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}:b')).state.days") == {}
            assert all('must not reach another account' not in json.dumps(write) for write in writes)
            page.get_by_role('button',name='Hủy',exact=True).click()
            page.locator('[data-sonner-toast][data-type="error"]').wait_for(state='detached')
            page.add_script_tag(content=Path('node_modules/axe-core/axe.min.js').read_text(encoding='utf-8'))
            violations = page.evaluate("async () => (await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>({html:n.html,target:n.target,summary:n.failureSummary}))}))")
            assert not violations,violations
            context.close()
            assert not errors,errors

            # Failure to checkpoint must not upload, and the browser lock must release for retry.
            context = browser.new_context(service_workers='block')
            context.route('**/fixture-cloud/*',cloud)
            addition = {**deepcopy(EMPTY),'version':1,'days':{'2026-11-19':{**deepcopy(DAY),'date':'2026-11-19'}}}
            context.add_init_script(f"localStorage.setItem('fixture-user','a');localStorage.setItem('{KEY}',{json.dumps(json.dumps(addition))});window.fixtureSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){{if(k.endsWith('.history'))throw new DOMException('full','QuotaExceededError');return window.fixtureSetItem.call(this,k,v);}};")
            page = context.new_page()
            count = len(writes)
            page.goto(URL)
            expect(page.locator('#error')).to_contain_text('Không lưu được bản phục hồi')
            assert len(writes) == count
            page.evaluate("Storage.prototype.setItem=window.fixtureSetItem;window.dispatchEvent(new Event('online'))")
            expect(page.locator('#pending')).to_have_text('false')
            assert set(remote['a']['days']) == {'2026-11-02','2026-11-19'}
            context.close()
            browser.close()
            print(f'{engine}: auth loss/reopen/scoped edits/explicit signout/legacy owner/conflict no-write/download/cancel/resolve/recovery PASS')

if __name__=='__main__': main()
