import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Instagram.module.scss";

interface InstagramProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Instagram({ caseData, onBack }: InstagramProps) {
  const { username, displayName, avatar, posts } = caseData.instagram;

  return (
    <AppScreen title={username} onBack={onBack} theme="light">
      <div className={styles.profile}>
        <img className={styles.avatar} src={avatar} alt={displayName} />
        <div className={styles.stats}>
          <div>
            <b>{posts.length}</b>
            <span>Posts</span>
          </div>
          <div>
            <b>1.2k</b>
            <span>Followers</span>
          </div>
          <div>
            <b>384</b>
            <span>Following</span>
          </div>
        </div>
      </div>
      <div className={styles.name}>{displayName}</div>

      <div className={styles.feed}>
        {posts.map((p, i) => (
          <div key={i} className={styles.post}>
            <div className={styles.postHeader}>
              <img className={styles.postAvatar} src={p.image} alt="" />
              <div>
                <div className={styles.postUser}>{username}</div>
                <div className={styles.postLocation}>{p.location}</div>
              </div>
            </div>
            <img className={styles.postImage} src={p.image} alt="" />
            {p.caption && (
              <div className={styles.caption}>
                <b>{username}</b> {p.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
