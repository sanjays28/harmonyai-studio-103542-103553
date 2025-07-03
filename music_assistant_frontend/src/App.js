import React, { useState, useRef } from 'react';
import './App.css';

// Color palette and modern minimal styling driven by CSS variables (see App.css)
const COLORS = {
  primary: '#1e1f26',
  secondary: '#232946',
  accent: '#f0544f',
};

// Sidebar: Project navigation and management
// PUBLIC_INTERFACE
function Sidebar({ projects, currentProjectId, onSelect, onAdd }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Projects</span>
        <button className="sidebar-add-btn" onClick={onAdd} title="Add New Project">
          +
        </button>
      </div>
      <ul className="sidebar-list">
        {projects.length === 0 && <li className="sidebar-item empty">No projects</li>}
        {projects.map((p) => (
          <li
            className={`sidebar-item${p.id === currentProjectId ? ' active' : ''}`}
            key={p.id}
            onClick={() => onSelect(p.id)}
            title={p.name}
          >
            {p.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Waveform visualization
// PUBLIC_INTERFACE
function Waveform({ waveformData }) {
  const canvasRef = useRef();

  React.useEffect(() => {
    if (!waveformData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw waveform as lines
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (waveformData.length) {
      for (let i = 0; i < waveformData.length; i++) {
        const x = (i / waveformData.length) * canvas.width;
        const y = (1 - waveformData[i]) * canvas.height * 0.9 + canvas.height * 0.05;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [waveformData]);
  return (
    <div className="waveform-container">
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        className="waveform-canvas"
        aria-label="Waveform visualization"
      />
    </div>
  );
}

// DAW-style Sequencer: Drag & drop loop area
// PUBLIC_INTERFACE
function Sequencer({ tracks, onDropSample, onMoveBlock, onNewTrack }) {
  const handleDrop = (e, trackIndex) => {
    const sample = e.dataTransfer.getData('text/sample');
    if (sample) onDropSample(sample, trackIndex);
  };
  return (
    <section className="sequencer">
      <header className="sequencer-header">
        <span>Sequencer</span>
        <button onClick={onNewTrack} className="sequencer-add-track-btn" title="Add Track">＋</button>
      </header>
      <div className="sequencer-grid">
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            className="sequencer-track"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, idx)}
          >
            <span className="track-name">{track.name}</span>
            <div className="track-blocks">
              {track.blocks.map((block, bidx) => (
                <SequencerBlock
                  key={block.id}
                  block={block}
                  onMove={(toIdx) => onMoveBlock(idx, bidx, toIdx)}
                  draggable
                />
              ))}
            </div>
          </div>
        ))}
        {tracks.length === 0 && (
          <div className="sequencer-no-track">No tracks. Click [＋] to add one!</div>
        )}
      </div>
    </section>
  );
}

// Helper: one block/loop in sequencer
// PUBLIC_INTERFACE
function SequencerBlock({ block, onMove, draggable }) {
  // Simple drag/drop, could be expanded
  return (
    <div
      className="block"
      draggable={draggable}
      onDragStart={e => e.dataTransfer.setData('text/block', block.id)}
    >
      {block.name}
    </div>
  );
}

// Virtual keyboard at the bottom
// PUBLIC_INTERFACE
function VirtualKeyboard({ onKeyClick, octave = 4 }) {
  // Simple one-octave C-major keyboard, expand as needed
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return (
    <div className="virtual-keyboard">
      {notes.map((n, idx) => (
        <button
          key={n}
          className={`key ${n.indexOf('#') > -1 ? 'black' : 'white'}`}
          onClick={() => onKeyClick(`${n}${octave}`)}
          tabIndex={0}
        >{n}</button>
      ))}
    </div>
  );
}

// Chat panel docked right
// PUBLIC_INTERFACE
function ChatPanel({ messages, onSend }) {
  const [input, setInput] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };
  return (
    <aside className="chat-panel">
      <header className="chat-header">AI Assistant</header>
      <div className="chat-messages">
        {messages.length === 0 && <div className="chat-placeholder">Ask for creative help!</div>}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          className="chat-input"
          autoFocus
        />
        <button type="submit" className="chat-send-btn" title="Send">→</button>
      </form>
    </aside>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Demo data and state
  const [projects, setProjects] = useState([{ id: 'demo1', name: "My First Project" }]);
  const [currentProjectId, setCurrentProjectId] = useState('demo1');
  const [tracks, setTracks] = useState([
    {
      id: 't1',
      name: 'Drums',
      blocks: [
        { id: 'b1', name: 'Kick Loop' },
        { id: 'b2', name: 'Snare Loop' }
      ]
    },
    {
      id: 't2',
      name: 'Bass',
      blocks: [{ id: 'b3', name: 'Bassline' }]
    }
  ]);
  const [waveformData, setWaveformData] = useState(
    Array.from({ length: 128 }, (_, i) => 0.5 + 0.5 * Math.sin(i / 5))
  );
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! Ask me for production tips or generate a new melody." }
  ]);
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // -- Project/track API scaffolding --
  // Would connect to backend via fetch/XHR here. Example function signatures:
  // REST endpoint examples:
  // GET /projects, POST /project, GET /project/:id, POST /track, etc.

  // PUBLIC_INTERFACE
  const handleAddProject = () => {
    const name = prompt("Project name:");
    if (!name) return;
    // TODO: call backend POST /project
    const id = `proj-${Date.now()}`;
    setProjects(ps => [...ps, { id, name }]);
    setCurrentProjectId(id);
    // TODO: fetch actual tracks for the new project
    setTracks([]);
  };

  // PUBLIC_INTERFACE
  const handleDropSample = (sample, trackIndex) => {
    // TODO: Backend add sample to project/track
    setTracks(ts => {
      const newTracks = [...ts];
      newTracks[trackIndex] = {
        ...newTracks[trackIndex],
        blocks: [
          ...newTracks[trackIndex].blocks,
          { id: `s-${Date.now()}`, name: sample }
        ]
      };
      return newTracks;
    });
  };

  // PUBLIC_INTERFACE
  const handleMoveBlock = (trackIdx, blockIdx, toIdx) => {
    // TODO: backend re-ordering, now just local
    setTracks(ts => {
      let blocks = [...ts[trackIdx].blocks];
      const [item] = blocks.splice(blockIdx, 1);
      blocks.splice(toIdx, 0, item);
      const newTracks = [...ts];
      newTracks[trackIdx] = { ...ts[trackIdx], blocks };
      return newTracks;
    });
  };

  // PUBLIC_INTERFACE
  const handleAddTrack = () => {
    const name = prompt("Track name:");
    if (!name) return;
    setTracks(ts => [
      ...ts,
      { id: `tr-${Date.now()}`, name, blocks: [] }
    ]);
  };

  // PUBLIC_INTERFACE
  const handleKeyClick = (note) => {
    // TODO: Send note to backend or play sound, trigger sound/visual feedback
    setChatMessages(msgs => [
      ...msgs,
      { role: 'user', text: `Played: ${note}` }
    ]);
  };

  // PUBLIC_INTERFACE
  const handleChatSend = (input) => {
    setChatMessages(msgs => [...msgs, { role: 'user', text: input }]);
    // Example: call backend and append AI's response.
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    })
      .then(res => res.json())
      .then(json => {
        if (json.reply) {
          setChatMessages(msgs => [...msgs, { role: 'ai', text: json.reply }]);
        }
      })
      .catch(() =>
        setChatMessages(msgs => [...msgs, { role: 'ai', text: "AI couldn't reply (backend not configured)." }])
      );
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <div className="studio-root">
        <Sidebar
          projects={projects}
          currentProjectId={currentProjectId}
          onSelect={setCurrentProjectId}
          onAdd={handleAddProject}
        />
        <main className="studio-main-content">
          <Waveform waveformData={waveformData} />
          <Sequencer
            tracks={tracks}
            onDropSample={handleDropSample}
            onMoveBlock={handleMoveBlock}
            onNewTrack={handleAddTrack}
          />
          <VirtualKeyboard onKeyClick={handleKeyClick} />
        </main>
        <ChatPanel messages={chatMessages} onSend={handleChatSend} />
      </div>
    </div>
  );
}

export default App;
