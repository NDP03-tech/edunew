import React, { useEffect, useState } from "react";

// ✅ Chuẩn hóa text để so sánh
const normalizeText = (text) =>
  text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase();

// ✅ Cắt đoạn văn bản thành các chunk gồm 1 từ + khoảng trắng (nếu có)
const splitTextIntoChunks = (text) => {
  const regex = /[^\s]+[\s]?/g;
  let match;
  let position = 0;
  const chunks = [];

  while ((match = regex.exec(text)) !== null) {
    const word = match[0];
    chunks.push({
      text: word,
      start: position,
      end: position + word.length,
    });
    position += word.length;
  }

  return chunks;
};

const FindHighlightRenderer = ({
  question,
  questionId,
  editable = true,
  initialAnswer = [],
  onAnswerChange,
}) => {
  const [chunks, setChunks] = useState([]);
  const [highlights, setHighlights] = useState(initialAnswer || []);
  const [selection, setSelection] = useState([]);

  useEffect(() => {
    setHighlights(initialAnswer || []);
  }, [initialAnswer]);

  useEffect(() => {
    const rawHtml = question?.question_text || "";

    // ✅ Unwrap <a class="cloze"> bằng cách giữ lại khoảng trắng nếu có
    const tmp = document.createElement("div");
    tmp.innerHTML = rawHtml;

    tmp.querySelectorAll("a.cloze").forEach((el) => {
      // ✅ Nếu phía trước không có khoảng trắng, thì thêm 1 dấu cách
      const prev = el.previousSibling;
      const needLeadingSpace =
        !prev ||
        (prev.nodeType === 3 && !/\s$/.test(prev.textContent)) ||
        (prev.nodeType === 1);
    
      if (needLeadingSpace) {
        el.before(document.createTextNode(" "));
      }
    
      // ✅ Nếu phía sau không có khoảng trắng, thì thêm 1 dấu cách
      const textNode = document.createTextNode(el.textContent);
      const next = el.nextSibling;
      const spaceNeeded =
        !next ||
        (next.nodeType === 3 && !/^\s/.test(next.nodeValue)) ||
        (next.nodeType === 1);
    
      const space = spaceNeeded ? document.createTextNode(" ") : null;
    
      el.replaceWith(textNode);
      if (space) textNode.after(space);
    });
    

    const plainText = tmp.textContent || tmp.innerText || "";
    const newChunks = splitTextIntoChunks(plainText);
    setChunks(newChunks);
  }, [question]);

  const handleMouseUp = () => {
    if (!editable) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelection([]);
      return;
    }

    const selectedSpanIds = [];
    const allSpans = document.querySelectorAll("[data-index]");
    const range = selection.getRangeAt(0);

    allSpans.forEach((span) => {
      if (range.intersectsNode(span)) {
        selectedSpanIds.push(parseInt(span.dataset.index, 10));
      }
    });

    setSelection(selectedSpanIds);
  };

  const highlightSelection = () => {
    if (!editable || selection.length === 0) return;
    const newHighlights = [...highlights];
    selection.forEach((index) => {
      const chunk = chunks[index];
      if (!chunk) return;
      const exists = newHighlights.find(
        (h) => h.start === chunk.start && h.end === chunk.end
      );
      if (!exists) {
        newHighlights.push({
          text: normalizeText(chunk.text),
          start: chunk.start,
          end: chunk.end,
        });
      }
    });

    setHighlights(newHighlights);
    onAnswerChange?.(questionId, newHighlights);
    setSelection([]);
  };

  const removeHighlight = () => {
    if (!editable || selection.length === 0) return;

    const updated = highlights.filter((h) => {
      return !selection.some((index) => {
        const chunk = chunks[index];
        return h?.start === chunk?.start && h?.end === chunk?.end;
      });
    });

    setHighlights(updated);
    onAnswerChange?.(questionId, updated);
    setSelection([]);
  };

  return (
    <div>
      {editable && (
        <div className="d-flex gap-2 mb-2">
          <button
            onClick={highlightSelection}
            className="btn btn-sm btn-outline-primary"
          >
            Highlight
          </button>
          <button
            onClick={removeHighlight}
            className="btn btn-sm btn-outline-danger"
          >
            Remove Highlight
          </button>
        </div>
      )}

      <div
        className="p-3 border rounded"
        onMouseUp={handleMouseUp}
        style={{
          userSelect: "text",
          minHeight: 150,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          width: "100%",
        }}
      >
        {chunks.map((chunk, index) => {
          const isHighlighted = highlights.some(
            (h) =>
              Math.abs(h.start - chunk.start) <= 1 &&
              Math.abs(h.end - chunk.end) <= 1
          );
          return (
            <span
              key={index}
              data-index={index}
              style={{
                backgroundColor: isHighlighted ? "yellow" : "transparent",
                display: "inline-block",
              }}
            >
              {chunk.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default FindHighlightRenderer;
