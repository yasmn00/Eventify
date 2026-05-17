import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './SeatSelection.css'; 

const SeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const eventName = location.state?.eventName || "Seçilen Etkinlik";

  const [selectedSeats, setSelectedSeats] = useState([]); 

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  // Yatayda 25 koltuk
  const cols = Array.from({ length: 25 }, (_, i) => i + 1);

  // Fiyatlandırma Fonksiyonu
  const getSeatPrice = (row) => {
    if (row === 'A') return 600; // En ön sıra VIP
    if (['K', 'L', 'M'].includes(row)) return 450; // Son 3 sıra Ekonomik
    return 500; // Geri kalan orta sıralar Standart
  };

  // Toplam Tutar Hesaplama
  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const row = seatId.charAt(0);
      return total + getSeatPrice(row);
    }, 0);
  };

  const handleSeatClick = (seatId) => {
    setSelectedSeats((prev) => 
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  return (
    <div className="seat-selection-container">
      <h2 className="notranslate">{eventName} - Koltuk Seçimi</h2>
      
      <div className="price-legend" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
         <div className="legend-item">🟡 VIP (A): <strong>600 TL</strong></div>
         <div className="legend-item">🔵 Orta: <strong>500 TL</strong></div>
         <div className="legend-item">🟢 Arka (K-M): <strong>450 TL</strong></div>
      </div>

      <div className="main-content">
        <div className="screen-and-seats" style={{ overflowX: 'auto' }}>
          <div className="screen">SAHNE / PERDE</div>
          
          <div className="seats-grid" style={{ minWidth: '900px' }}>
            {rows.map(row => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                {cols.map(col => {
                  const seatId = `${row}${col}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const price = getSeatPrice(row);
                  
                  return (
                    <div
                      key={seatId}
                      className={`seat ${isSelected ? 'selected' : 'available'}`}
                      style={{ 
                        width: '25px', 
                        height: '25px', 
                        fontSize: '10px',
                        backgroundColor: isSelected ? '#2ecc71' : (price === 600 ? '#f1c40f' : (price === 450 ? '#bdc3c7' : '#3498db'))
                      }}
                      onClick={() => handleSeatClick(seatId)}
                      title={`${seatId} - ${price} TL`}
                    >
                      {col}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="booking-summary">
          <h3>Seçim Özeti</h3>
          <div className="selected-list">
            {selectedSeats.length > 0 ? (
              <ul>
                {selectedSeats.map(seat => (
                  <li key={seat} className="notranslate" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Koltuk: {seat}</span>
                    <span>{getSeatPrice(seat.charAt(0))} TL</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Henüz koltuk seçilmedi.</p>
            )}
          </div>
          
          <hr />
          
          <div className="total-price notranslate">
            <strong>Toplam: </strong>
            <span style={{ fontSize: '28px', color: '#e67e22', fontWeight: 'bold' }}>  
               {calculateTotal()} TL 
            </span>
          </div>

,          <button 
            className="checkout-button" 
            disabled={selectedSeats.length === 0}
            onClick={() => { 
              navigate('/cart', { 
                state: { 
                  biletler: selectedSeats, 
                  toplamTutar: calculateTotal(),
                  eventName: eventName ,
                } 
              });
            }}
          >
            {selectedSeats.length} Bilet İle Ödemeye Geç
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;