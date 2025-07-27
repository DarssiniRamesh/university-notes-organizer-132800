import React, { useEffect, useState } from "react";

// PUBLIC_INTERFACE
/**
 * Sidebar for categories/tags navigation and management
 * @param {object} props
 * @param {boolean} open
 * @param {function} onToggle
 * @param {string} apiBase
 * @param {string} token
 */
function Sidebar({ open, onToggle, apiBase, token }) {
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState("");

  // Fetch categories/tags
  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, [token, apiBase]);

  // Add category
  function handleAddCategory(e) {
    e.preventDefault();
    setError("");
    if (!newCat.trim()) return;
    fetch(`${apiBase}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newCat })
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to add"))
      .then(cat => {
        setCategories([...categories, cat]);
        setNewCat("");
      })
      .catch(() => setError("Could not add category."));
  }

  // Delete category
  function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;
    fetch(`${apiBase}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) setCategories(categories.filter(c => c.id !== id));
      });
  }

  // Responsive toggle
  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <div className="sidebar__header">
        <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: 18 }}>Categories</span>
        <button className="btn btn-secondary sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {open ? "←" : "→"}
        </button>
      </div>
      <ul className="sidebar__list">
        {categories.map(cat => (
          <li
            key={cat.id}
            className={`sidebar__item${cat.id === activeId ? " active" : ""}`}
            onClick={() => setActiveId(cat.id)}
          >
            <span>{cat.name}</span>
            <button className="btn btn-small btn-accent" title="Delete" style={{marginLeft:6}}
              onClick={e => { e.stopPropagation(); handleDelete(cat.id); }}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <form className="sidebar__form" onSubmit={handleAddCategory}>
        <input
          className="sidebar__input"
          value={newCat}
          aria-label="Add category"
          onChange={e => setNewCat(e.target.value)}
          placeholder="Add category"
        />
        <button className="btn btn-accent btn-small" type="submit">Add</button>
      </form>
      {error && <div style={{ color: "var(--accent)", fontSize: 13 }}>{error}</div>}
    </aside>
  );
}

export default Sidebar;
