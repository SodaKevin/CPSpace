// socialSpace/components/CommentList.jsx

import { useComments } from "../hooks/useComments";
import CommentItem from "./CommentItem";
import "./Comment.css";
import { usePublicPseudonyms } from "../hooks/usePublicPseudonyms";

export default function CommentList({ postId, expanded }) {
  const comments = useComments(postId);
  const pseudonymMap = usePublicPseudonyms();

  const visibleComments = expanded
    ? comments
    : comments.slice(0, 2); // latest 1–2

  if (visibleComments.length === 0) return null;

  return (
    <div className="comment-list">
      {visibleComments.map(c => (
        <CommentItem
          key={c.id}
          comment={c}
          pseudonym={pseudonymMap[c.authorId] || "Anonymous"}
        />
      ))}
    </div>
  );
}
