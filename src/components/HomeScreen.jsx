import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  FileText,
  MapPin,
  Search,
  Users
} from 'lucide-react';
import Header from './Header.jsx';
import { useApp } from '../context/AppContext.jsx';

const ICONS = {
  book: BookOpen,
  file: FileText,
  users: Users,
  award: Award
};

export default function HomeScreen() {
  const {
    searchQuery,
    setSearchQuery,
    runSearch,
    activeQuery,
    searchResults,
    searching,
    catalog
  } = useApp();

  // Cada card filtra pela fonte cadastrada no banco (recursos_rapidos.filtro_fonte_id).
  const openResource = (resource) => {
    runSearch('', { fonte: resource.fonte, label: resource.title });
  };

  return (
    <div className="app-shell">
      <Header />
      <div className="page-main">
        <main>
          <section className="search-hero">
            <h1>O que você quer pesquisar hoje?</h1>
            <p>
              Acesse teses, artigos de iniciação científica, acervos e monitorias da Unifor em um só lugar.
            </p>
            <form
              className="search-box"
              onSubmit={(event) => {
                event.preventDefault();
                runSearch();
              }}
            >
              <Search size={18} color="#9ca3af" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Digite palavras-chave, título de artigo ou nome do professor..."
              />
              <button type="submit" className="btn btn-primary">
                Buscar
              </button>
            </form>
            <div className="quick-tags">
              <span>Populares:</span>
              {catalog.termosPopulares.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag ${searchQuery === tag ? 'is-active' : ''}`}
                  onClick={() => {
                    setSearchQuery(tag);
                    runSearch(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {activeQuery ? (
            <section>
              <h2 className="section-title">
                Resultados para “{activeQuery}”
              </h2>
              {searching ? (
                <p className="empty-state">Buscando…</p>
              ) : searchResults.length === 0 ? (
                <p className="empty-state">
                  Nenhum documento encontrado. Tente outro termo ou uma das buscas populares.
                </p>
              ) : (
                <div className="results-list">
                  {searchResults.map((doc) => (
                    <article key={doc.id} className="result-card">
                      <h3>{doc.title}</h3>
                      <div className="result-meta">
                        <span>{doc.type}</span>
                        <span>{doc.author}</span>
                        <span>{doc.year}</span>
                        <span>{doc.area}</span>
                        <span>{doc.source}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section>
              <h2 className="section-title">Acesso Rápido</h2>
              <div className="resources-grid">
                {catalog.recursos.map((resource) => {
                  const Icon = ICONS[resource.icon];
                  return (
                    <article key={resource.id} className="card resource-card">
                      <div>
                        <div className="card-header">
                          <div className="card-icon">
                            <Icon size={20} />
                          </div>
                          <h3>{resource.title}</h3>
                        </div>
                        <p>{resource.description}</p>
                      </div>
                      <button type="button" className="card-link" onClick={() => openResource(resource)}>
                        {resource.action} <ArrowRight size={14} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        <aside className="sidebar">
          <div className="event-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}>Agenda Unifor</h3>
              <Calendar color="#5243ed" size={20} />
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Principais eventos acadêmicos e culturais
            </p>
            <div className="event-list">
              {catalog.eventos.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="date-badge">
                    <span className="day">{event.day}</span>
                    <span className="month">{event.month}</span>
                  </div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p>
                      <MapPin size={12} /> {event.place}
                    </p>
                    <span className="badge-tag">{event.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
