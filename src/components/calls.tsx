import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Phone,
  PhoneIncoming,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
} from "lucide-react";
import { useStore } from "../lib/store";
import { uid } from "../lib/model";
import type { Row } from "../lib/model";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, Badge } from "./common";
import { RecordEditor } from "./editor";
export function CallSimulator({
  customerId = "",
  incoming = false,
  onClose,
}: {
  customerId?: string;
  incoming?: boolean;
  onClose: () => void;
}) {
  const { data, save } = useStore();
  const { t } = useTranslation();
  const [customer, setCustomer] = useState(customerId);
  const [phase, setPhase] = useState("ready");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [held, setHeld] = useState(false);
  const [notes, setNotes] = useState("");
  const [disposition, setDisposition] = useState("");
  const [error, setError] = useState("");
  const [follow, setFollow] = useState<"tickets" | "followups" | null>(null);
  const c = data.records.customers.find((c) => c.id === customer);
  useEffect(() => {
    if (phase === "active" && !held) {
      const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase, held]);
  const submit = () => {
    if (!c || !disposition || !notes.trim()) {
      setError("Add a disposition and conversation notes");
      return;
    }
    save("calls", {
      id: uid(),
      name: incoming ? "Incoming call" : "Outgoing call",
      status: "Completed",
      createdAt: new Date().toISOString(),
      customerId: c.id,
      campaignId: c.campaignId,
      employeeId: c.employeeId,
      direction: incoming ? "Incoming" : "Outgoing",
      duration: String(seconds),
      disposition,
      notes,
    });
    onClose();
  };
  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={t(
          incoming ? "Incoming call simulation" : "Outgoing call simulation",
        )}
        description={t("Simulation only. No telephone connection is made.")}
      >
        <div className="dialog-body stack">
          {phase === "ready" ? (
            <>
              <label className="field">
                <span>{t("Customer")}</span>
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                >
                  <option value="">{t("Select an option")}</option>
                  {data.records.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {t(c.language)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                disabled={!c}
                onClick={() => setPhase(incoming ? "ringing" : "active")}
              >
                <Phone size={16} />
                {t(
                  incoming ? "Simulate incoming call" : "Start simulated call",
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="call-identity">
                <Avatar name={c?.name || ""} />
                <h2>{c?.name}</h2>
                <p>
                  {c?.phone} · {t(c?.language || "English")}
                </p>
                <Badge tone={phase === "active" ? "green" : "amber"}>
                  {t(
                    phase === "ringing"
                      ? "Incoming call"
                      : phase === "ended"
                        ? "Call ended"
                        : held
                          ? "On hold"
                          : "Connected",
                  )}
                </Badge>
                <div className="call-timer">
                  {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                  {String(seconds % 60).padStart(2, "0")}
                </div>
              </div>
              {phase === "ringing" && (
                <div className="call-controls">
                  <Button onClick={() => setPhase("active")}>
                    <PhoneIncoming size={18} />
                    {t("Answer")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (c)
                        save("calls", {
                          id: uid(),
                          name: "Missed call",
                          status: "Missed",
                          createdAt: new Date().toISOString(),
                          customerId: c.id,
                          campaignId: c.campaignId,
                          employeeId: c.employeeId,
                          direction: "Incoming",
                          duration: "0",
                          disposition: "No answer",
                          notes: "",
                        });
                      onClose();
                    }}
                  >
                    {t("Decline")}
                  </Button>
                </div>
              )}
              {phase === "active" && (
                <div className="call-controls">
                  <Button variant="outline" onClick={() => setMuted(!muted)}>
                    {muted ? <MicOff size={17} /> : <Mic size={17} />}{" "}
                    {t(muted ? "Unmute" : "Mute")}
                  </Button>
                  <Button variant="outline" onClick={() => setHeld(!held)}>
                    {held ? <Play size={17} /> : <Pause size={17} />}{" "}
                    {t(held ? "Resume" : "Hold")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setPhase("ended")}
                  >
                    <PhoneOff size={17} />
                    {t("End call")}
                  </Button>
                </div>
              )}
              {["active", "ended"].includes(phase) && (
                <label className="field">
                  <span>{t("Conversation notes")}</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </label>
              )}
              {phase === "ended" && (
                <>
                  <label className="field">
                    <span>{t("Disposition")}</span>
                    <select
                      aria-label={t("Disposition")}
                      value={disposition}
                      onChange={(e) => setDisposition(e.target.value)}
                    >
                      <option value="">{t("Select an option")}</option>
                      {[
                        "Resolved",
                        "Follow-up needed",
                        "Escalated",
                        "No answer",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {t(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setFollow("tickets")}
                    >
                      {t("Create ticket")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setFollow("followups")}
                    >
                      {t("Schedule follow-up")}
                    </Button>
                  </div>
                  {error && (
                    <p className="error" role="alert">
                      {t(error)}
                    </p>
                  )}
                  <Button onClick={submit}>{t("Save call & finish")}</Button>
                </>
              )}
            </>
          )}
        </div>
      </Dialog>
      {follow && c && (
        <RecordEditor
          entity={follow}
          onClose={() => setFollow(null)}
          preset={{
            customerId: c.id,
            clientId: c.clientId,
            campaignId: c.campaignId,
            employeeId: c.employeeId,
            notes,
          }}
        />
      )}
    </>
  );
}
function makeSample() {
  const rate = 8000;
  const length = rate * 8;
  const buffer = new ArrayBuffer(44 + length * 2);
  const v = new DataView(buffer);
  const text = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  text(0, "RIFF");
  v.setUint32(4, 36 + length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  text(36, "data");
  v.setUint32(40, length * 2, true);
  for (let i = 0; i < length; i++) {
    const time = i / rate;
    const envelope = Math.sin(Math.PI * (time % 1));
    v.setInt16(
      44 + i * 2,
      Math.sin(2 * Math.PI * (Math.floor(time) % 2 ? 440 : 330) * time) *
        envelope *
        1200,
      true,
    );
  }
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}
export function RecordingPlayer() {
  const { t } = useTranslation();
  const [src, setSrc] = useState("");
  useEffect(() => {
    const url = makeSample();
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, []);
  return (
    <div className="recording">
      <h3>{t("Demo recording")}</h3>
      <p>{t("Synthetic audio sample · 8 seconds · no customer audio")}</p>
      <audio
        controls
        src={src}
        preload="metadata"
        aria-label={t("Demo recording")}
      />
    </div>
  );
}
