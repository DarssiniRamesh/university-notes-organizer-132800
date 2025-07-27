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
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ color: "var(--primary)", flex: 1, margin: 0, fontSize: 20 }}>My Notes</h3>
          <button className="btn btn-accent btn-small" onClick={handleCreateNew}>+ New Note</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="notes-list-ul">
            {notes.map((note) => (
              <li
                className={`notes-list-item${selected && note.id === selected.id ? " selected" : ""}`}
                key={note.id}
                onClick={() => handleNoteSelect(note)}
              >
                <b>{note.title.slice(0, 40) || "[No title]"}</b>
                <div style={{ fontSize: 13, color: "var(--primary)" }}>
                  {note.updated_at ? new Date(note.updated_at).toLocaleString() : ""}
                </div>
                <button
                  className="btn btn-small btn-secondary"
                  style={{ marginLeft: 8, float: 'right' }}
                  onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                  title="Delete"
                >🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="notes-editor">
        {editing || !selected ? (
          <form className="editor-form" onSubmit={handleSave}>
            <input
              name="title"
              className="editor-title"
              placeholder="Note title"
              value={editor.title}
              onChange={handleEditorChange}
              style={{ fontSize: 18, marginBottom: 10 }}
              required
            />
            <textarea
              name="content"
              className="editor-content"
              placeholder="Note content..."
              rows={12}
              value={editor.content}
              onChange={handleEditorChange}
              style={{ fontSize: 16, width: "100%" }}
              required
            />
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="submit">
                {editor.id ? "Save Changes" : "Create Note"}
              </button>
              {selected && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  style={{ marginLeft: 10 }}
                  onClick={() => setEditing(false)}
                >Cancel</button>
              )}
            </div>
          </form>
        ) : selected ? (
          <div>
            <h2 style={{ margin: 0, color: "var(--primary)" }}>{selected.title}</h2>
            <div style={{ whiteSpace: "pre-wrap", margin: "12px 0" }}>{selected.content}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 22 }}>
              Last edited: {selected.updated_at ? new Date(selected.updated_at).toLocaleString() : ""}
            </div>
            <button className="btn btn-accent" onClick={() => setEditing(true)} style={{ marginTop: 10 }}>
              Edit Note
            </button>
          </div>
        ) : (
          <div style={{ color: "#aaa", fontSize: 22, margin: 60, textAlign: "center" }}>
            Select or create a note to start!
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
