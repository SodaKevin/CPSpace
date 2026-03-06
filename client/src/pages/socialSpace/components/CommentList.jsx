// socialSpace/components/CommentList.jsx

import { useComments } from "../hooks/useComments";
import CommentItem from "./CommentItem";
import "./Comment.css";
import { useDisplayNames } from "../hooks/useDisplayNames";

export default function CommentList({ postId, expanded }) {
  const comments = useComments(postId);

  const visibleComments = expanded
    ? comments
    : comments.slice(0, 2);

  const displayNameMap = useDisplayNames(visibleComments);

  if (visibleComments.length === 0) return null;

  return (
    <div className="comment-list">
      {visibleComments.map(c => (
        <CommentItem
          key={c.id}
          comment={c}
          pseudonym={displayNameMap[c.authorId] || "Anonymous"}
        />
      ))}
    </div>
  );
}