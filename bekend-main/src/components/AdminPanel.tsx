import { useState } from 'react';
import type { LabSupply } from '../data/supplies';
import './AdminPanel.css';

interface AdminPanelProps {
  supplies: LabSupply[];
  onAddSupply: (supply: LabSupply) => void;
  onEditSupply: (supply: LabSupply) => void;
  onDeleteSupply: (id: string) => void;
  onClose: () => void;
}

export const AdminPanel = ({
  supplies,
  onAddSupply,
  onEditSupply,
  onDeleteSupply,
  onClose,
}: AdminPanelProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LabSupply>>({
    name: '',
    category: 'Equipment',
    description: '',
    price: 0,
    availability: 'In Stock',
    manufacturer: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const supply = supplies.find((s) => s.id === editingId);
      if (supply) {
        onEditSupply({ ...supply, ...formData } as LabSupply);
      }
      setEditingId(null);
    } else {
      const newSupply: LabSupply = {
        id: `NEW${Date.now()}`,
        name: formData.name || '',
        category: (formData.category || 'Equipment') as 'Equipment' | 'Reagent' | 'Consumable',
        description: formData.description || '',
        price: formData.price || 0,
        availability: (formData.availability || 'In Stock') as 'In Stock' | 'Out of Stock' | 'On Order',
        manufacturer: formData.manufacturer,
      };
      onAddSupply(newSupply);
    }

    setFormData({
      name: '',
      category: 'Equipment',
      description: '',
      price: 0,
      availability: 'In Stock',
      manufacturer: '',
    });
    setIsAdding(false);
  };

  const handleEdit = (supply: LabSupply) => {
    setFormData(supply);
    setEditingId(supply.id);
    setIsAdding(true);
  };

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>⚙️ Әкімші Панелі</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-content">
          {/* Add/Edit Form */}
          {isAdding ? (
            <div className="admin-form-section">
              <h3>{editingId ? 'Өнімді өңдеу' : 'Жаңа өнім қосу'}</h3>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Атауы *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Категория *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="Equipment">Жабдық</option>
                      <option value="Reagent">Реактив</option>
                      <option value="Consumable">Тұтынушы</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Сипаттамасы *</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Баға ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || 0}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Қолда бар лығы *</label>
                    <select name="availability" value={formData.availability} onChange={handleInputChange}>
                      <option value="In Stock">Қолда бар</option>
                      <option value="Out of Stock">Қолда жоқ</option>
                      <option value="On Order">Заказ бойынша</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Өндіруші</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn-submit">
                    {editingId ? 'Сақтау' : 'Қосу'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      setFormData({
                        name: '',
                        category: 'Equipment',
                        description: '',
                        price: 0,
                        availability: 'In Stock',
                        manufacturer: '',
                      });
                    }}
                  >
                    Болдырмау
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <button className="btn-add-supply" onClick={() => setIsAdding(true)}>
                ➕ Жаңа өнім қосу
              </button>

              <div className="supplies-table-container">
                <table className="supplies-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Атауы</th>
                      <th>Категория</th>
                      <th>Баға</th>
                      <th>Қолда бар</th>
                      <th>Әрекеттер</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplies.map((supply) => (
                      <tr key={supply.id}>
                        <td className="cell-id">{supply.id}</td>
                        <td className="cell-name">{supply.name}</td>
                        <td className="cell-category">{supply.category}</td>
                        <td className="cell-price">${supply.price.toFixed(2)}</td>
                        <td className="cell-availability">
                          <span className={`availability-badge ${supply.availability.replace(' ', '-').toLowerCase()}`}>
                            {supply.availability}
                          </span>
                        </td>
                        <td className="cell-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(supply)}
                            title="Өңдеу"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => {
                              if (confirm('Осы өнімді өшіргіңіз келе ме?')) {
                                onDeleteSupply(supply.id);
                              }
                            }}
                            title="Жою"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
