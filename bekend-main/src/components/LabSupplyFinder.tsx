import { useState, useMemo, useRef, useEffect } from 'react';
import type { LabSupply } from '../data/supplies';
import { labSupplies as initialSupplies } from '../data/supplies';
import { Header } from './Header';
import { AdminPanel } from './AdminPanel';
import './LabSupplyFinder.css';

export const LabSupplyFinder = () => {
  const [supplies, setSupplies] = useState<LabSupply[]>(initialSupplies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [suggestions, setSuggestions] = useState<LabSupply[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<LabSupply | null>(null);
  const [favorites, setFavorites] = useState<LabSupply[]>([]);
  const [compareList, setCompareList] = useState<LabSupply[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({ quantity: 1, notes: '' });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Equipment', 'Reagent', 'Consumable'];

  // Load favorites and compare list from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('labSupplyFavorites');
    const savedCompare = localStorage.getItem('labSupplyCompare');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedCompare) setCompareList(JSON.parse(savedCompare));
  }, []);

  // Save favorites to localStorage
  const updateFavorites = (newFavorites: LabSupply[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('labSupplyFavorites', JSON.stringify(newFavorites));
  };

  // Save compare list to localStorage
  const updateCompareList = (newCompareList: LabSupply[]) => {
    setCompareList(newCompareList);
    localStorage.setItem('labSupplyCompare', JSON.stringify(newCompareList));
  };

  // Generate autocomplete suggestions
  const generateSuggestions = (query: string): LabSupply[] => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return supplies
      .filter((supply) => {
        const matchesQuery =
          supply.name.toLowerCase().includes(lowerQuery) ||
          supply.description.toLowerCase().includes(lowerQuery) ||
          (supply.manufacturer?.toLowerCase() || '').includes(lowerQuery);

        const matchesCategory =
          selectedCategory === 'All' || supply.category === selectedCategory;

        return matchesQuery && matchesCategory;
      })
      .slice(0, 8);
  };

  // Update suggestions as user types
  useEffect(() => {
    if (searchQuery.trim()) {
      setSuggestions(generateSuggestions(searchQuery));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, selectedCategory]);

  // Filter supplies based on search and category
  const filteredSupplies = useMemo(() => {
    const displayList = showFavorites ? favorites : supplies;
    return displayList.filter((supply) => {
      const matchesQuery =
        !searchQuery ||
        supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supply.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || supply.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, selectedCategory, showFavorites, favorites, supplies]);

  const handleSuggestionClick = (supply: LabSupply) => {
    setSearchQuery(supply.name);
    setShowSuggestions(false);
    setSelectedSupply(supply);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedSupply(null);
  };

  const handleSupplyClick = (supply: LabSupply) => {
    setSelectedSupply(supply);
  };

  const toggleFavorite = (supply: LabSupply) => {
    const isFavorited = favorites.some((f) => f.id === supply.id);
    if (isFavorited) {
      updateFavorites(favorites.filter((f) => f.id !== supply.id));
    } else {
      updateFavorites([...favorites, supply]);
    }
  };

  const toggleCompare = (supply: LabSupply) => {
    const isComparing = compareList.some((c) => c.id === supply.id);
    if (isComparing) {
      updateCompareList(compareList.filter((c) => c.id !== supply.id));
    } else {
      if (compareList.length < 3) {
        updateCompareList([...compareList, supply]);
      } else {
        alert('Максимум 3 өнімді салыстыруға болады');
      }
    }
  };

  const isFavorited = (supply: LabSupply) => favorites.some((f) => f.id === supply.id);
  const isComparing = (supply: LabSupply) => compareList.some((c) => c.id === supply.id);

  const getAvailabilityClass = (availability: string) => {
    switch (availability) {
      case 'In Stock':
        return 'availability-in-stock';
      case 'Out of Stock':
        return 'availability-out-of-stock';
      case 'On Order':
        return 'availability-on-order';
      default:
        return '';
    }
  };

  const handleAddSupply = (supply: LabSupply) => {
    setSupplies([...supplies, supply]);
  };

  const handleEditSupply = (supply: LabSupply) => {
    setSupplies(supplies.map((s) => (s.id === supply.id ? supply : s)));
  };

  const handleDeleteSupply = (id: string) => {
    setSupplies(supplies.filter((s) => s.id !== id));
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `✅ Сұраныс жіберілді!\n\nӨнім: ${selectedSupply?.name}\nСаны: ${requestData.quantity}\nЕскертпесі: ${requestData.notes || 'жоқ'}`,
    );
    setRequestData({ quantity: 1, notes: '' });
    setShowRequestForm(false);
  };

  return (
    <div className="lab-supply-finder">
      <Header
        favoritesCount={favorites.length}
        compareCount={compareList.length}
        isAdmin={true}
        onShowAdmin={() => setShowAdmin(true)}
        onShowFavorites={() => setShowFavorites(!showFavorites)}
        onShowCompare={() => setShowCompare(!showCompare)}
      />

      {showCompare && compareList.length > 0 && (
        <div className="compare-view">
          <div className="compare-header">
            <h2>🔄 Өнімдерді салыстыру</h2>
            <button className="close-btn" onClick={() => setShowCompare(false)}>
              ✕
            </button>
          </div>
          <div className="compare-table">
            <table>
              <thead>
                <tr>
                  <th>Параметрі</th>
                  {compareList.map((supply) => (
                    <th key={supply.id}>{supply.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Категория</td>
                  {compareList.map((supply) => (
                    <td key={supply.id}>{supply.category}</td>
                  ))}
                </tr>
                <tr>
                  <td>Баға</td>
                  {compareList.map((supply) => (
                    <td key={supply.id}>${supply.price.toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  <td>Қолда бар</td>
                  {compareList.map((supply) => (
                    <td key={supply.id}>{supply.availability}</td>
                  ))}
                </tr>
                <tr>
                  <td>Өндіруші</td>
                  {compareList.map((supply) => (
                    <td key={supply.id}>{supply.manufacturer || '-'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Сипаттамасы</td>
                  {compareList.map((supply) => (
                    <td key={supply.id}>{supply.description}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!showCompare && (
        <div className="finder-container">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-box">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Жабдықтарды іздеңіз... (мысалы, 'центрифуга', 'этанол', 'PCR')"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((supply) => (
                  <div
                    key={supply.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(supply)}
                  >
                    <div className="suggestion-name">{supply.name}</div>
                    <div className="suggestion-category">
                      {supply.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <label>Категория:</label>
            <div className="category-buttons">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'All' ? 'Барлығы' : cat === 'Equipment' ? 'Жабдық' : cat === 'Reagent' ? 'Реактив' : 'Тұтынушы'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-area">
          {/* Left: Supply List */}
          <div className="supplies-list-container">
            <h2>
              {showFavorites ? '⭐ Таңдаулылар' : '📦 Қол жетімді өнімдер'} ({filteredSupplies.length})
            </h2>
            <div className="supplies-list">
              {filteredSupplies.length > 0 ? (
                filteredSupplies.map((supply) => (
                  <div
                    key={supply.id}
                    className={`supply-card ${selectedSupply?.id === supply.id ? 'selected' : ''}`}
                    onClick={() => handleSupplyClick(supply)}
                  >
                    <div className="supply-header">
                      <h3>{supply.name}</h3>
                      <div className="supply-actions">
                        <button
                          className={`action-btn favorite-btn ${isFavorited(supply) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(supply);
                          }}
                          title="Таңдаулыларға қосу"
                        >
                          ⭐
                        </button>
                        <button
                          className={`action-btn compare-btn ${isComparing(supply) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(supply);
                          }}
                          title="Салыстыруға қосу"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                    <div className="supply-meta">
                      <span className="category-tag">{supply.category}</span>
                      <span
                        className={`availability ${getAvailabilityClass(supply.availability)}`}
                      >
                        {supply.availability}
                      </span>
                    </div>
                    <p className="supply-description">{supply.description}</p>
                    <div className="supply-footer">
                      <span className="price">${supply.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>Өнімдер табылмады.</p>
                  <p>Іздеу немесе категора сүзгісін өзгертіңіз.</p>
                </div>
              )}
            </div>
          </div>

            {selectedSupply && (
              <div className="supply-detail-container">
                <div className="supply-detail">
                  <h2>{selectedSupply.name}</h2>

                  <div className="detail-section">
                    <label>ID:</label>
                    <p>{selectedSupply.id}</p>
                  </div>

                  <div className="detail-section">
                    <label>Категория:</label>
                    <p>{selectedSupply.category}</p>
                  </div>

                  <div className="detail-section">
                    <label>Сипаттамасы:</label>
                    <p>{selectedSupply.description}</p>
                  </div>

                  <div className="detail-section">
                    <label>Баға:</label>
                    <p className="price-large">${selectedSupply.price.toFixed(2)}</p>
                  </div>

                  <div className="detail-section">
                    <label>Қолда бар лығы:</label>
                    <p
                      className={`availability-large ${getAvailabilityClass(
                        selectedSupply.availability,
                      )}`}
                    >
                      {selectedSupply.availability}
                    </p>
                  </div>

                  {selectedSupply.manufacturer && (
                    <div className="detail-section">
                      <label>Өндіруші:</label>
                      <p>{selectedSupply.manufacturer}</p>
                    </div>
                  )}

                  <div className="detail-actions">
                    <button
                      className={`btn-detail-action favorite ${isFavorited(selectedSupply) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(selectedSupply)}
                    >
                      {isFavorited(selectedSupply) ? '❤️ Таңдаулыдан алу' : '🤍 Таңдаулыларға қосу'}
                    </button>
                    <button
                      className={`btn-detail-action compare ${isComparing(selectedSupply) ? 'active' : ''}`}
                      onClick={() => toggleCompare(selectedSupply)}
                    >
                      {isComparing(selectedSupply) ? '🔄 Салыстырудан алу' : '🔄 Салыстыруға қосу'}
                    </button>
                  </div>

                  <button
                    className="btn-request"
                    onClick={() => setShowRequestForm(!showRequestForm)}
                  >
                    📬 Сұраныс жіберу
                  </button>

                  {showRequestForm && (
                    <form onSubmit={handleRequestSubmit} className="request-form">
                      <div className="form-group">
                        <label>Саны:</label>
                        <input
                          type="number"
                          min="1"
                          value={requestData.quantity}
                          onChange={(e) =>
                            setRequestData({
                              ...requestData,
                              quantity: parseInt(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Ескертпе:</label>
                        <textarea
                          value={requestData.notes}
                          onChange={(e) =>
                            setRequestData({ ...requestData, notes: e.target.value })
                          }
                          placeholder="Қосымша ақпарат..."
                        />
                      </div>
                      <button type="submit" className="btn-submit-request">
                        ✅ Сұраныс жіберу
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
        </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel
          supplies={supplies}
          onAddSupply={handleAddSupply}
          onEditSupply={handleEditSupply}
          onDeleteSupply={handleDeleteSupply}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
};
