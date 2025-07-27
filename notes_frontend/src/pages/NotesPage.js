import React, { useEffect, useState } from "react";

// PUBLIC_INTERFACE
/**
 * NotesPage - main notes listing and editor
 * @param {object} props
 * @param {string} apiBase
 * @param {object} user {user, token}
 */
function NotesPage({ apiBase, user }) {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState({ title: "", content: "", id: null });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [filterCatId, setFilterCatId] = useState(null);

  // Load notes
  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/notes/`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then((data) => {
        // data is array of notes per OpenAPI
        setNotes(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [apiBase, user.token]);

  function handleNoteSelect(note) {
    setSelected(note);
    setEditor({ title: note.title, content: note.content, id: note.id });
    setEditing(false);
  }

  function handleCreateNew() {
    setEditor({ title: "", content: "", id: null });
    setSelected(null);
    setEditing(true);
  }

  function handleEditorChange(e) {
    setEditor({ ...editor, [e.target.name]: e.target.value });
  }

  function handleSave(e) {
    e.preventDefault();
    const url = editor.id ? `${apiBase}/notes/${editor.id}` : `${apiBase}/notes/`;
    const method = editor.id ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ title: editor.title, content: editor.content })
    })
      .then(res => res.ok ? res.json() : Promise.reject("Save failed"))
      .then((data) => {
        if (editor.id) {
          setNotes(notes.map((n) => (n.id === data.id ? data : n)));
        } else {
          setNotes([data, ...notes]);
        }
        setSelected(data);
        setEditing(false);
      })
      .catch(() => window.alert("Could not save note."));
  }

  function handleDelete(noteId) {
    if (!window.confirm("Delete this note?")) return;
    fetch(`${apiBase}/notes/${noteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => {
      if (res.status === 204) {
        setNotes(notes.filter(n => n.id !== noteId));
        setSelected(null);
      }
    });
  }

  return (
    <div className="notes-layout">
      <div className="notes-list">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: "var(--primary)", flex: 1, margin: 0, fontSize: 20, paddingLeft: 2 }}>My Notes</h3>
          <button className="btn btn-accent btn-small" style={{ minWidth: 95 }} onClick={handleCreateNew}>+ New Note</button>
        </div>
        {loading ? (
          <div style={{ padding: "15px 8px", textAlign: "center" }}>Loading...</div>
        ) : (
          <ul className="notes-list-ul">
            {notes.map((note) => (
              <li
                className={`notes-list-item${selected && note.id === selected.id ? " selected" : ""}`}
                key={note.id}
                onClick={() => handleNoteSelect(note)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ maxWidth: "81%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {note.title.slice(0, 40) || "[No title]"}
                  </b>
                  <button
                    className="btn btn-small btn-secondary"
                    style={{ marginLeft: 8, minWidth: 32, marginTop: 0 }}
                    onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                    title="Delete"
                  >🗑️</button>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--primary)", marginTop: 1 }}>
                  {note.updated_at ? new Date(note.updated_at).toLocaleString() : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="notes-editor">
        {editing || !selected ? (
          <form className="editor-form" onSubmit={handleSave}>
            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              name="title"
              className="editor-title"
              placeholder="Note title"
              value={editor.title}
              onChange={handleEditorChange}
              required
            />
            <label htmlFor="note-content">Content</label>
            <textarea
              id="note-content"
              name="content"
              className="editor-content"
              placeholder="Note content..."
              rows={9}
              value={editor.content}
              onChange={handleEditorChange}
              required
            />
            <div className="editor-buttons">
              <button className="btn btn-primary" type="submit">
                {editor.id ? "Save Changes" : "Create Note"}
              </button>
              {selected && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setEditing(false)}
                >Cancel</button>
              )}
            </div>
          </form>
        ) : selected ? (
          <div>
            <h2 style={{ margin: 0, color: "var(--primary)", fontWeight: 700 }}>{selected.title}</h2>
            <div style={{ whiteSpace: "pre-wrap", margin: "14px 0 7px 0", fontSize: 15.7 }}>{selected.content}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 20, marginBottom: 12 }}>
              Last edited: {selected.updated_at ? new Date(selected.updated_at).toLocaleString() : ""}
            </div>
            <button className="btn btn-accent" onClick={() => setEditing(true)} style={{ marginTop: 7 }}>
              Edit Note
            </button>
          </div>
        ) : (
          <div style={{ color: "#aaa", fontSize: 21, margin: "55px 0", textAlign: "center" }}>
            Select or create a note to start!
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
