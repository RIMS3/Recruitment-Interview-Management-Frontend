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
    
    // --- State Tổng tiền cược toàn hệ thống ---
    const [totalBetTai, setTotalBetTai] = useState(0);
    const [totalBetXiu, setTotalBetXiu] = useState(0);

    // --- State Người dùng & Online ---
    const [balance, setBalance] = useState(0); 
    const [onlineCount, setOnlineCount] = useState(0);
    const [isOpening, setIsOpening] = useState(false); 
    const [canOpen, setCanOpen] = useState(false);     
    const [history, setHistory] = useState([]);
    const [userBetTai, setUserBetTai] = useState(0);
    const [userBetXiu, setUserBetXiu] = useState(0);

    // --- State Chat ---
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef(null);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    const fullName = localStorage.getItem("fullName") || "Người chơi";
    const connectionRef = useRef(null);

    // ==========================================================================
    // 1. TỰ ĐỘNG GỬI TIN NHẮN CẢNH BÁO MỖI 3 GIÂY
    // ==========================================================================
    useEffect(() => {
        const warningInterval = setInterval(() => {
            const systemMsg = {
                userName: "HỆ THỐNG",
                message: "Đây là 1 dự án mang tính học tập không thể quy đổi ra tiền mặt, Hãy là 1 công dân tuân thủ pháp luật",
                isSystem: true 
            };
            setMessages(prev => [...prev, systemMsg].slice(-50));
        }, 3000);
        return () => clearInterval(warningInterval);
    }, []);

    // ==========================================================================
    // 2. CÁC HÀM API
    // ==========================================================================
    const fetchBalance = async () => {
        if (!userId || !token) return;
        try {
            const res = await axios.get(`${API_BASE}/api/refill/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(typeof res.data === 'number' ? res.data : res.data.balance);
        } catch (error) { console.error("Lỗi lấy số dư:", error); }
    };

    const fetchHistory = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE}/api/game/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data.filter(h => h.result).slice(-18));
        } catch (error) { console.error("Lỗi lấy lịch sử:", error); }
    };

    const isTai = (side) => side?.toLowerCase().includes('tai');
    const isXiu = (side) => side?.toLowerCase().includes('xiu');

    // ==========================================================================
    // 3. SIGNALR LOGIC
    // ==========================================================================
    useEffect(() => {
        if (!token || connectionRef.current) return;
        fetchHistory(); fetchBalance();

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE}/taixiu-hub`, {
                accessTokenFactory: () => token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        const setupSignalRListeners = (conn) => {
            conn.on("OnlineCount", (count) => setOnlineCount(count));
            conn.on("ReceiveMessage", (msg) => {
                setMessages(prev => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1];
                        if (last.message === msg.message && last.userName === msg.userName) return prev;
                    }
                    return [...prev, msg].slice(-50);
                });
            });
            conn.on("UpdateTotalBet", (data) => {
                setTotalBetTai(data.tai);
                setTotalBetXiu(data.xiu);
            });
            conn.on("Countdown", (s) => {
                setTime(s);
                if (s > 0) { setNextRoundIn(0); setIsOpening(false); setCanOpen(false); setResultSide(""); }
            });
            conn.on("RoundStart", (id) => {
                setRoundId(id); setIsLocked(false); setIsOpening(false); setCanOpen(false);
                setDices([1, 1, 1]); setUserBetTai(0); setUserBetXiu(0);
                setTotalBetTai(0); setTotalBetXiu(0); fetchBalance(); 
            });
            conn.on("RoundClosed", () => setIsLocked(true));
            conn.on("Result", (data) => {
                setDices([data.dice1, data.dice2, data.dice3]);
                setResultSide(data.result); setCanOpen(true); 
                setTimeout(fetchHistory, 2000); setTimeout(fetchBalance, 3500);
            });
            conn.on("NextRoundCountdown", (s) => {
                setNextRoundIn(s); setTime(0);
                if(s <= 3) setIsOpening(true);
            });
        };

        const startConnection = async () => {
            try { await connection.start(); setupSignalRListeners(connection); connectionRef.current = connection; } 
            catch (err) { setTimeout(startConnection, 5000); }
        };
        startConnection();
        return () => { if (connectionRef.current) connectionRef.current.stop(); };
    }, [token]);

    // ==========================================================================
    // 4. HANDLERS
    // ==========================================================================
    const handlePlaceBet = async (type) => {
        if (isLocked || time <= 0) return alert("Hệ thống đã đóng cược!");
        if (balance < betAmount) return alert("Số dư không đủ!");
        try {
            await axios.post(`${API_BASE}/api/game/bet`, 
                { BetType: type, amount: betAmount, UserId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (isTai(type)) setUserBetTai(prev => prev + betAmount);
            else setUserBetXiu(prev => prev + betAmount);
            setBalance(prev => prev - betAmount);
        } catch (error) { alert(error.response?.data || "Lỗi đặt cược"); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !connectionRef.current) return;
        try {
            await connectionRef.current.invoke("SendMessage", `${fullName}@system.com`, newMessage);
            setNewMessage("");
        } catch (err) { console.error(err); }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    if (!token) return <div className="error-screen">Vui lòng đăng nhập!</div>;

    return (
        <div className="game-container">
            <div className="game-table">
                {/* --- TOP BAR --- */}
                <div className="user-info-bar">
                    <div className="online-status">
                        <span className="dot-online"></span>
                        Trực tuyến: <strong>{onlineCount}</strong>
                    </div>
                    <div className="balance-box">
                        <span className="coin-icon">💰</span>
                        <span className="balance-amount">{balance.toLocaleString()}</span>
                        <button className="refresh-balance" onClick={fetchBalance}>↻</button>
                    </div>
                </div>

                {/* --- TIMER --- */}
                <div className="table-header">
                    <div className="round-tag">Phiên: #{roundId}</div>
                    <div className="timer-wrapper">
                        {nextRoundIn > 0 ? (
                            <div className="count-zoom timer-orange">{nextRoundIn} <span className="status-text">CHỜ PHIÊN</span></div>
                        ) : (
                            <div className={`count-zoom ${time <= 5 ? 'timer-red' : 'timer-green'}`}>{time} <span className="status-text">ĐẶT CƯỢC</span></div>
                        )}
                    </div>
                </div>

                {/* --- MAIN ACTION AREA --- */}
                <div className="action-area">
                    <div className="game-main-display">
                        
                        {/* BÊN XỈU */}
                        <div className="side-display">
                            <div className="system-total-bet top-display">
                                Tổng: {totalBetXiu.toLocaleString()}
                            </div>
                            <div className={`big-side-text xiu-text ${isXiu(resultSide) && isOpening ? 'winner-active' : ''}`}>
                                XỈU
                            </div>
                            <div className={`user-bet-val ${userBetXiu > 0 ? 'has-bet' : ''}`}>
                                Cược: {userBetXiu.toLocaleString()}
                            </div>
                        </div>

                        {/* PLATE & BOWL */}
                        <div className="plate-container">
                            <div className="plate">
                                <div className="dice-wrap">
                                    {dices.map((d, i) => (
                                        <div key={i} className={`dice dice-${d}`}>
                                            {[...Array(d)].map((_, dotIdx) => <span key={dotIdx} className="dot"></span>)}
                                        </div>
                                    ))}
                                </div>                          
                                <div 
                                    className={`bowl ${isOpening ? 'bowl-open' : ''} ${canOpen && !isOpening ? 'bowl-shake' : ''}`} 
                                    onClick={() => canOpen && setIsOpening(true)}
                                ></div>
                            </div>
                            {canOpen && !isOpening && <div className="hint-text">CHẠM ĐỂ MỞ BÁT!</div>}
                        </div>

                        {/* BÊN TÀI */}
                        <div className="side-display">
                            <div className="system-total-bet top-display">
                                Tổng: {totalBetTai.toLocaleString()}
                            </div>
                            <div className={`big-side-text tai-text ${isTai(resultSide) && isOpening ? 'winner-active' : ''}`}>
                                TÀI
                            </div>
                            <div className={`user-bet-val ${userBetTai > 0 ? 'has-bet' : ''}`}>
                                Cược: {userBetTai.toLocaleString()}
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- CHIPS & BET BUTTONS --- */}
                <div className="betting-interface">
                    <button className="bet-box xiu" onClick={() => handlePlaceBet('Xiu')} disabled={isLocked}>
                        <div className="bet-title">XỈU</div>
                        <div className="bet-rate">1 ĂN 1.95</div>
                    </button>
                    
                    <div className="chip-rack">
                        <div className="selected-amount">MỨC CƯỢC: <span>{betAmount.toLocaleString()}</span></div>
                        <div className="chips-row">
                            {[1000, 5000, 10000, 50000, 100000].map(val => (
                                <div key={val} className={`chip chip-${val} ${betAmount === val ? 'active' : ''}`} onClick={() => setBetAmount(val)}>
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

                {/* --- HISTORY --- */}
                <div className="history-section">
                    <div className="history-list">
                        {history.map((item, index) => {
                            const winTai = isTai(item.result);
                            return (
                                <div key={index} className={`history-item ${winTai ? 'h-tai' : 'h-xiu'}`}>
                                    {winTai ? 'T' : 'X'}<span className="h-tooltip">{item.dice1+item.dice2+item.dice3} ({item.dice1}-{item.dice2}-{item.dice3})</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- LIVE STREAM CHAT --- */}
            <div className="chat-sidebar">
                <div className="chat-header"><span className="live-dot">●</span> TRÒ CHUYỆN TRỰC TIẾP</div>
                <div className="chat-messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-row ${m.isSystem ? "system-row" : ""}`}>
                            <div className="chat-avatar" style={{ backgroundColor: m.isSystem ? "#ff4d4d" : "#5a5a5a" }}>{m.userName?.charAt(0).toUpperCase()}</div>
                            <div className="chat-content">
                                <span className="chat-username">{m.userName}</span>
                                <span className="chat-text-msg">{m.message}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="chat-footer">
                    <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                        <input type="text" placeholder="Phát biểu cảm nghĩ..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" className="send-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaiXiuGame;