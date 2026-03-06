/* client/src/pages/DMconvo/ChatWindow.jsx */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { runTransaction } from "firebase/firestore";

import { useRelationship } from "./hooks/useRelationship";
import { useDisplayNames } from "../socialSpace/hooks/useDisplayNames";

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();
  const currentUid = auth.currentUser?.uid;

  const targetUid = conversation?.participants?.find(
    p => p !== currentUid
  );

  const displayMap = useDisplayNames(
    targetUid ? [{ authorId: targetUid }] : []
  );

  const displayName =
    targetUid && displayMap[targetUid]
      ? displayMap[targetUid]
      : "Anonymous";

  const { status, canChat } =
    useRelationship(currentUid, targetUid);

  useEffect(() => {
    if (!conversation) return;

    const q = query(
      collection(
        db,
        "conversations",
        conversation.id,
        "messages"
      ),
      orderBy("seq", "asc")
    );

    const unsub = onSnapshot(q, snap => {
      setMessages(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, [conversation]);

  async function handleSend() {
    if (!canChat || !input.trim()) return;

    try {
      const convoRef = doc(db, "conversations", conversation.id);
      const messagesRef = collection(
        db,
        "conversations",
        conversation.id,
        "messages"
      );

      await runTransaction(db, async (transaction) => {
        const convoSnap = await transaction.get(convoRef);

        if (!convoSnap.exists()) {
          throw "Conversation does not exist!";
        }

        const currentNextSeq = convoSnap.data().nextSeq || 1;

        const newMessageRef = doc(messagesRef);

        transaction.set(newMessageRef, {
          senderId: currentUid,
          body: input,
          seq: currentNextSeq,
          createdAt: serverTimestamp(),
          hiddenUntilConsent: false
        });

        transaction.update(convoRef, {
          nextSeq: currentNextSeq + 1,
          lastMessageAt: serverTimestamp()
        });
      });

      setInput("");

    } catch (err) {
      console.error("Send failed:", err);
    }
  }

  if (!conversation) {
    return <div className="dm-empty">Select a chat</div>;
  }

  return (
    <div className="dm-chat">
      <div
        className="chat-header"
        onClick={() => {
          if (targetUid) {
            navigate(`/user/${targetUid}`);
          }
        }}
      >
        <div className="profile-circle">
          {displayName[0]?.toUpperCase()}
        </div>
        <span>{displayName}</span>
      </div>

        <div className="dm-messages">
          {messages.map((m, i) => {
            const isMine = m.senderId === currentUid;
            const prev = messages[i - 1];
            const showSpacing = !prev || prev.senderId !== m.senderId;

            return (
              <div
                key={m.id}
                className={`dm-msg-wrapper ${isMine ? "mine" : ""}`}
                style={{ marginTop: showSpacing ? "14px" : "4px" }}
              >
                <div className={`dm-msg ${isMine ? "mine" : ""}`}>
                  {m.body}
                </div>
              </div>
            );
          })}

        </div>

        {status !== "consented" && (
            <div className="dm-warning">
            {status === "pending" &&
                "Waiting for acceptance..."}
            {status === "revoked" &&
                "Connection revoked. Messaging disabled."}
            </div>
        )}

        <div className="dm-input">
            <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!canChat}
            placeholder={
                canChat
                ? "Type a message..."
                : "Messaging disabled"
            }
            />
            <button
            onClick={handleSend}
            disabled={!canChat}
            >
            Send
            </button>
        </div>
    </div>
  );
}
