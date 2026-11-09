import React from "react";
import { createRoot } from "react-dom/client";
import { useTracker } from "../../src/modules/tracking/data/use-tracker";
import { setWfhHours } from "../../src/modules/tracking/core/domain";
import { TrackerApp } from "../../src/modules/app-shell/tracker-app";
import "../../src/app/globals.css";

function Fixture() {
  const tracker = useTracker();
  return <>
    <output id="loading">{String(tracker.loading)}</output>
    <output id="user">{tracker.user?.uid ?? "guest"}</output>
    <output id="state">{JSON.stringify(tracker.state)}</output>
    <output id="pending">{String(tracker.pending)}</output>
    <output id="syncing">{String(tracker.syncing)}</output>
    <output id="error">{tracker.error || tracker.syncError}</output>
    <button onClick={() => void tracker.save((state) => setWfhHours(state, "2026-11-02", 10, Date.now()))}>Lưu 10 giờ</button>
    <button onClick={tracker.reload}>Tải lại</button>
    <button onClick={() => {
      localStorage.setItem("fixture-user", "b");
      window.dispatchEvent(new Event("fixture-auth"));
    }}>Tài khoản B</button>
  </>;
}
createRoot(document.getElementById("root")!).render(location.search === "?ui" ? <TrackerApp /> : <Fixture />);
