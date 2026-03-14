import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import './TaiXiuGame.css';

const API_BASE = "https://localhost:7272";

const TaiXiuGame = () => {
    // --- State Game ---
    const [roundId, setRoundId] = useState(0);
    const [time, setTime] = useState(30);
    const [nextRoundIn, setNextRoundIn] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [dices, setDices] = useState([1, 1, 1]);
    const [totalScore, setTotalScore] = useState(0);
    const [resultSide, setResultSide] = useState("");
    const [betAmount, setBetAmount] = useState(1000);
    
    // --- State Người dùng & Hệ thống ---
    const [balance, setBalance] = useState(0); 
    const [onlineCount, setOnlineCount] = useState(0); // State hiển thị số người online
    const [isOpening, setIsOpening] = useState(false); 
    const [canOpen, setCanOpen] = useState(false);     
    const [history, setHistory] = useState([]);
    const [userBetTai, setUserBetTai] = useState(0);
    const [userBetXiu, setUserBetXiu] = useState(0);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    const connectionRef = useRef(null);

    // --- Hàm lấy dữ liệu từ API ---
    const fetchBalance = async () => {
        if (!userId || !token) return;
        try {
            const res = await axios.get(`${API_BASE}/api/refill/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(typeof res.data === 'number' ? res.data : res.data.balance);
        } catch (error) {
            console.error("Lỗi lấy số dư:", error);
        }
    };

    const fetchHistory = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE}/api/game/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data.filter(h => h.result).slice(-18));
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
        }
    };

    const isTai = (side) => side?.toLowerCase().includes('tai');
    const isXiu = (side) => side?.toLowerCase().includes('xiu');

    // --- Quản lý SignalR Connection ---
    useEffect(() => {
        if (!token || connectionRef.current) return;
        
        fetchHistory();
        fetchBalance();

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE}/taixiu-hub`, {
                accessTokenFactory: () => token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        // 1. Lắng nghe số người Online
        connection.on("OnlineCount", (count) => {
            setOnlineCount(count);
        });

        connection.on("Countdown", (s) => {
            setTime(s);
            if (s > 0) {
                setNextRoundIn(0);
                setIsOpening(false); 
                setCanOpen(false);
                setTotalScore(0);
                setResultSide("");
            }
        });

        connection.on("RoundStart", (id) => {
            setRoundId(id);
            setIsLocked(false);
            setTotalScore(0);
            setResultSide("");
            setIsOpening(false);
            setCanOpen(false);
            setDices([1, 1, 1]);
            setUserBetTai(0);
            setUserBetXiu(0);
            fetchBalance(); 
        });

        connection.on("RoundClosed", () => setIsLocked(true));

        connection.on("Result", (data) => {
            setDices([data.dice1, data.dice2, data.dice3]);
            setTotalScore(data.dice1 + data.dice2 + data.dice3);
            setResultSide(data.result);
            setIsLocked(true);
            setCanOpen(true); 
            setTimeout(fetchHistory, 2000);
            setTimeout(fetchBalance, 3500);
        });

        connection.on("NextRoundCountdown", (s) => {
            setNextRoundIn(s);
            setTime(0);
            if(s <= 3) setIsOpening(true);
        });

        const startConnection = async () => {
            try {
                await connection.start();
                await connection.invoke("JoinGame");
                connectionRef.current = connection;
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
                setTimeout(startConnection, 5000);
            }
        };

        startConnection();

        return () => { 
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [token]);

    // --- Xử lý sự kiện người dùng ---
    const handlePlaceBet = async (type) => {
        if (isLocked || time <= 0) return alert("Hệ thống đã đóng cược!");
        if (balance < betAmount) return alert("Số dư của bạn không đủ!");

        try {
            await axios.post(`${API_BASE}/api/game/bet`, 
                { BetType: type, amount: betAmount, UserId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (isTai(type)) setUserBetTai(prev => prev + betAmount);
            else setUserBetXiu(prev => prev + betAmount);
            
            setBalance(prev => prev - betAmount);
        } catch (error) {
            alert(error.response?.data || "Lỗi đặt cược");
            fetchBalance(); 
        }
    };

    const handleBowlClick = () => { if (canOpen) setIsOpening(true); };

    if (!token) return <div className="error-screen">Vui lòng đăng nhập!</div>;

    return (
        <div className="game-container">
            <div className="game-table">
                {/* --- THANH THÔNG TIN: ONLINE & SỐ DƯ --- */}
                <div className="user-info-bar">
                    <div className="online-status">
                        <span className="dot-online"></span>
                        Người chơi: <strong>{onlineCount}</strong>
                    </div>
                    <div className="balance-box">
                        <span className="coin-icon">💰</span>
                        <span className="balance-amount">{balance.toLocaleString()}</span>
                        <button className="refresh-balance" onClick={fetchBalance}>↻</button>
                    </div>
                </div>

                {/* --- TIMER & ROUND INFO --- */}
                <div className="table-header">
                    <div className="round-tag">Phiên: #{roundId}</div>
                    <div className="timer-wrapper">
                        {nextRoundIn > 0 ? (
                            <div className="count-zoom timer-orange">
                                {nextRoundIn} <span className="status-text">CHỜ PHIÊN</span>
                            </div>
                        ) : (
                            <div className={`count-zoom ${time <= 5 ? 'timer-red' : 'timer-green'}`}>
                                {time} <span className="status-text">ĐẶT CƯỢC</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- KHU VỰC HIỂN THỊ CHÍNH (XỈU - BÁT - TÀI) --- */}
                <div className="action-area">
                    <div className="game-main-display">
                        <div className="side-display">
                            <div className={`big-side-text xiu-text ${isXiu(resultSide) && isOpening ? 'winner-active' : ''}`}>
                                XỈU
                            </div>
                            <div className={`user-bet-val ${userBetXiu > 0 ? 'has-bet' : ''}`}>
                                {userBetXiu.toLocaleString()}
                            </div>
                        </div>

                        <div className="plate-container">
                            <div className="plate">
                                <div className="dice-wrap">
                                    {dices.map((d, i) => (
                                        <div key={i} className={`dice dice-${d}`}>
                                            {[...Array(d)].map((_, dotIdx) => (
                                                <span key={dotIdx} className="dot"></span>
                                            ))}
                                        </div>
                                    ))}
                                </div>                          
                                <div 
                                    className={`bowl ${isOpening ? 'bowl-open' : ''} ${canOpen && !isOpening ? 'bowl-shake' : ''}`} 
                                    onClick={handleBowlClick}
                                ></div>
                            </div>
                            {canOpen && !isOpening && <div className="hint-text">CHẠM ĐỂ MỞ BÁT!</div>}
                        </div>

                        <div className="side-display">
                            <div className={`big-side-text tai-text ${isTai(resultSide) && isOpening ? 'winner-active' : ''}`}>
                                TÀI
                            </div>
                            <div className={`user-bet-val ${userBetTai > 0 ? 'has-bet' : ''}`}>
                                {userBetTai.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- GIAO DIỆN ĐẶT CƯỢC & CHIP --- */}
                <div className="betting-interface">
                    <button className="bet-box xiu" onClick={() => handlePlaceBet('Xiu')} disabled={isLocked}>
                        <div className="bet-title">XỈU</div>
                        <div className="bet-rate">1 ĂN 1.95</div>
                    </button>
                    
                    <div className="chip-rack">
                        <div className="selected-amount">MỨC CƯỢC: <span>{betAmount.toLocaleString()}</span></div>
                        <div className="chips-row">
                            {[1000, 5000, 10000, 50000, 100000].map(val => (
                                <div 
                                    key={val} 
                                    className={`chip chip-${val} ${betAmount === val ? 'active' : ''}`} 
                                    onClick={() => setBetAmount(val)}
                                >
                                    {val >= 1000 ? `${val/1000}K` : val}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="bet-box tai" onClick={() => handlePlaceBet('Tai')} disabled={isLocked}>
                        <div className="bet-title">TÀI</div>
                        <div className="bet-rate">1 ĂN 1.95</div>
                    </button>
                </div>

                {/* --- LỊCH SỬ PHIÊN --- */}
                <div className="history-section">
                    <div className="history-title">LỊCH SỬ PHIÊN</div>
                    <div className="history-list">
                        {history.map((item, index) => {
                            const winTai = isTai(item.result);
                            return (
                                <div key={index} className={`history-item ${winTai ? 'h-tai' : 'h-xiu'}`}>
                                    {winTai ? 'T' : 'X'}
                                    <span className="h-tooltip">
                                        {item.dice1 + item.dice2 + item.dice3} ({item.dice1}-{item.dice2}-{item.dice3})
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaiXiuGame;