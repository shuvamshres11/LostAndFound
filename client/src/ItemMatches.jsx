import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Nav from './components/nav.jsx';
import LandingNav from './components/LandingNav.jsx';
import Footer from './components/footer.jsx';
import './lostitems.css';
import { useToast } from './components/ToastContext.jsx';

const ItemMatches = () => {
  const { itemId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState({ myItem: null, matches: [] });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchSpecificMatches = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/item/${itemId}`);
        if (!response.ok) throw new Error("Failed to fetch matches for this item");
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
        showToast("Error fetching potential matches", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificMatches();
  }, [itemId, currentUser]);

  return (
    <div className="full-page-wrapper">
      {currentUser ? <Nav /> : <LandingNav />}
      <main className="content-container">
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Generating Matches...</h2>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
               {data.myItem && (
                 <>
                   <img src={data.myItem.image} alt="My Item" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '20px' }} />
                   <div>
                     <Link to="/matches" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px', display: 'inline-block' }}>← Back to All Uploads</Link>
                     <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111' }}>Matches for <span style={{color: '#00B1A8'}}>{data.myItem.title}</span></h1>
                     <p style={{ margin: 0, color: '#888', marginTop: '4px' }}>AI Match Results ranked by visual similarity.</p>
                   </div>
                 </>
               )}
            </div>

            <div className="item-grid">
              {!data.matches || data.matches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666', gridColumn: '1 / -1', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ccc' }}>
                  <h3 style={{ marginBottom: '10px' }}>No Matches Found Yet</h3>
                  <p>When the AI finds a potential match for this item, it will appear here!</p>
                </div>
              ) : (
                data.matches.map((match, index) => (
                  <div key={index} className="item-card" style={{ position: 'relative', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                    
                    {/* Floating Match % Badge */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', right: '12px', 
                      background: 'linear-gradient(135deg, #00B1A8, #007c77)', 
                      color: '#fff', 
                      padding: '6px 14px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem',
                      fontWeight: '700', 
                      boxShadow: '0 4px 10px rgba(0, 177, 168, 0.3)',
                      zIndex: 10,
                      letterSpacing: '0.5px'
                    }}>
                      {match.score}% MATCH
                    </div>
                    
                    {/* Standardized Image Container */}
                    <div className="image-container">
                      <img src={match.matchItem.image} alt={match.matchItem.title} className="item-image" />
                      <span className={`status-badge ${match.matchItem.type === 'lost' ? 'lost' : 'found'}`}>
                         {match.matchItem.type}
                      </span>
                    </div>
                    
                    {/* Clean Content Area */}
                    <div className="card-content">
                      <div className="title-row">
                         <h3>{match.matchItem.title}</h3>
                      </div>
                      
                      <div className="info-row">
                        <span className="icon">📂</span>
                        <span>{match.matchItem.category}</span>
                      </div>
                      <div className="info-row">
                        <span className="icon">📍</span>
                        <span>{match.matchItem.location}</span>
                      </div>

                      <p className="posted-by">
                        Posted by {match.matchItem.user?.firstName || 'Unknown User'}
                      </p>

                      <Link to={`/items/${match.matchItem._id}`} style={{
                        display: 'block', 
                        textAlign: 'center', 
                        background: '#f9fafa',
                        color: '#00B1A8',
                        fontWeight: '600',
                        padding: '10px 0',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        marginTop: '15px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdfc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafa'}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ItemMatches;
