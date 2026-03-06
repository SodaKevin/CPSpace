/* client/src/pages/DMconvo/DMPage.jsx */

import { useState, useRef, useEffect } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import PendingListModal from "./modals/PendingListModal";
import BlockListModal from "./modals/BlockListModal";
import "./dm.css";

export default function DMPage() {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const menuRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dm-layout">

      {/* BODY ONLY */}
      <div className="dm-body">

        {/* LEFT PANEL */}
        <div className="dm-left">

          <div className="dm-header">
            <h2>Chats</h2>

            <div className="dm-menu" ref={menuRef}>
              <button
                className="dm-dots"
                onClick={() => setMenuOpen(p => !p)}
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="dm-dropdown">
                  <div
                    className="dm-dropdown-item"
                    onClick={() => {
                      setActiveModal("pending");
                      setMenuOpen(false);
                    }}
                  >
                    Pending Requests
                  </div>

                  <div
                    className="dm-dropdown-item"
                    onClick={() => {
                      setActiveModal("blocked");
                      setMenuOpen(false);
                    }}
                  >
                    Blocked Users
                  </div>
                </div>
              )}
            </div>
          </div>

          <ConversationList
            selected={selectedConvo}
            onSelect={setSelectedConvo}
          />

        </div>

        {/* RIGHT PANEL */}
        <div className="dm-right">
          <ChatWindow conversation={selectedConvo} />
        </div>

      </div>

      {/* MODALS */}
      {activeModal === "pending" && (
        <PendingListModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "blocked" && (
        <BlockListModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );

}
