import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Tinder.module.scss";

interface TinderProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Tinder({ caseData, onBack }: TinderProps) {
  const [tab, setTab] = useState<"matches" | "messages">("matches");
  const { matches, matchThread } = caseData.client;

  return (
    <AppScreen title="Tinder" onBack={onBack} theme="light">
      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === "matches" ? styles.tabActive : styles.tab}
          onClick={() => setTab("matches")}
        >
          Matches
        </button>
        <button
          type="button"
          className={tab === "messages" ? styles.tabActive : styles.tab}
          onClick={() => setTab("messages")}
        >
          Messages
        </button>
      </div>

      {tab === "matches" ? (
        <div className={styles.grid}>
          {matches.map((m) => (
            <div key={m.name} className={styles.card}>
              <img className={styles.photo} src={m.photo} alt={m.name} />
              {m.matched && <span className={styles.matchBadge}>Match</span>}
              <span className={styles.label}>
                {m.name}, {m.age}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.thread}>
          <div className={styles.threadHeader}>
            <img className={styles.threadAvatar} src={matchThread.avatar} alt={matchThread.name} />
            <span className={styles.threadName}>{matchThread.name}</span>
          </div>
          <div className={styles.chatBg}>
            {matchThread.msgs.map((m, i) => (
              <div key={i} className={m.me ? styles.bubbleMe : styles.bubbleThem}>
                {m.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppScreen>
  );
}
