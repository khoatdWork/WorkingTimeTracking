"use client";
import { useState } from "react";
import { Download, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { usePwa } from "./use-pwa";

export function PwaPanel({ pwa, busy }: { pwa: ReturnType<typeof usePwa>; busy: boolean }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="panel form-stack" aria-labelledby="pwa-title">
      <div className="section-heading">
        <h2 id="pwa-title">Cài ứng dụng</h2>
        <Smartphone size={19} aria-hidden="true" />
      </div>
      <p className="help" role="status">
        {pwa.standalone ? "Bạn đang mở Đủ giờ dưới dạng ứng dụng." : "Thêm Đủ giờ vào màn hình chính để mở như một ứng dụng."}
        {pwa.ready && " Giao diện đã sẵn sàng mở khi mất mạng."}
      </p>
      {pwa.canInstall && !pwa.standalone && (
        <Button variant="outline" onClick={pwa.install} disabled={busy}>
          <Download aria-hidden="true" /> Cài Đủ giờ
        </Button>
      )}
      {!pwa.standalone && (
        <p className="help">
          iPhone/iPad: mở bằng Safari, chọn Chia sẻ → Thêm vào Màn hình chính.
          Android hoặc máy tính: mở menu trình duyệt, chọn Cài ứng dụng hoặc Thêm vào màn hình chính nếu có.
        </p>
      )}
      <p className="notice">
        Dữ liệu luôn lưu trên thiết bị, có thể chấm công khi mất mạng.
        App tự đồng bộ Firebase khi có mạng và đã đăng nhập Google, kể cả sau khi mở lại app.
        Lần đầu hãy mở app có mạng và chờ giao diện sẵn sàng. Xuất JSON định kỳ để có bản sao lưu.
      </p>
      {pwa.waiting && (
        <>
          <p className="help" role="status">Có phiên bản mới. Lưu các thay đổi trước khi cập nhật.</p>
          <Button variant="outline" disabled={busy || pwa.updating || !pwa.online} onClick={() => setConfirm(true)}>
            <RefreshCw aria-hidden="true" /> {pwa.updating ? "Đang cập nhật…" : "Cập nhật ứng dụng"}
          </Button>
        </>
      )}
      {pwa.error && <p className="form-error" role="alert">{pwa.error}</p>}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cập nhật và mở lại ứng dụng?</AlertDialogTitle>
            <AlertDialogDescription>
              Cửa sổ này sẽ tải lại. Hãy lưu cài đặt đang sửa trước khi tiếp tục. Dữ liệu đã lưu và ca đang chạy được giữ nguyên; các cửa sổ khác không tự tải lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Để sau</AlertDialogCancel>
            <AlertDialogAction disabled={busy || !pwa.online} onClick={pwa.update}>Cập nhật và tải lại</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
