"use client";
import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseClients, firebaseConfigured } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Cloud, HardDrive, LogIn, LogOut, ExternalLink } from "lucide-react";
export function AccountPanel({
  user,
  busy,
}: {
  user: User | null;
  busy: boolean;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function login() {
    setPending(true);
    setError("");
    try {
      await signInWithPopup(firebaseClients().auth, new GoogleAuthProvider());
    } catch {
      setError(
        "Chưa đăng nhập được. Hãy cho phép cửa sổ đăng nhập và kiểm tra tên miền trong Firebase Authentication.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel account-panel" aria-labelledby="account-title">
      <div className="section-heading">
        <h2 id="account-title">Lưu trữ & tài khoản</h2>
        {user ? <Cloud size={19} /> : <HardDrive size={19} />}
      </div>
      <p>
        {user
          ? `Đã đăng nhập: ${user.email || user.displayName}`
          : "Đang lưu trên trình duyệt này. Xuất bản sao lưu để giữ dữ liệu khi đổi máy hoặc xóa trình duyệt."}
      </p>
      {!firebaseConfigured && (
        <div className="notice">
          <strong>Firebase chưa được kết nối</strong>
          <p>
            Bạn vẫn có thể chấm công trên thiết bị. Chủ ứng dụng cần cấu hình
            Firebase để bật đăng nhập và đồng bộ.
          </p>
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
          >
            Mở Firebase Console <ExternalLink size={13} />
          </a>
        </div>
      )}
      {firebaseConfigured && !user && (
        <>
          <Button onClick={login} disabled={pending || busy} variant="outline">
            <LogIn />
            {pending ? "Đang đăng nhập…" : "Đăng nhập với Google"}
          </Button>
          <p className="help">
            Sau đăng nhập, app tự đưa dữ liệu đang lưu trên thiết bị lên Firebase.
            Nếu chưa có dữ liệu local, app tải sổ Firebase về thiết bị.
          </p>
        </>
      )}
      {user && (
        <>
          <p className="help">
            Mỗi lần lưu đều giữ bản local trước, rồi tự đồng bộ khi có mạng.
            Chỉ báo đã đồng bộ sau khi Firebase xác nhận. Bản local được giữ riêng theo tài khoản.
          </p>
          <Button
            variant="outline"
            disabled={busy || pending}
            onClick={async () => {
              setPending(true);
              try {
                await signOut(firebaseClients().auth);
              } catch {
                setError("Chưa đăng xuất được. Hãy thử lại.");
              } finally {
                setPending(false);
              }
            }}
          >
            <LogOut />
            Đăng xuất
          </Button>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
