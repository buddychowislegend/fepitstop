"use client";
import { useState, useRef, useEffect } from "react";

interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  shape?: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
  arrowType?: string;
}

const componentTypes = [
  { type: "page", label: "Page", color: "#3B82F6", icon: "📄" },
  { type: "component", label: "Component", color: "#10B981", icon: "🧩" },
  { type: "state", label: "State Store", color: "#F59E0B", icon: "🗃️" },
  { type: "api", label: "API Call", color: "#EF4444", icon: "🔌" },
  { type: "router", label: "Router", color: "#8B5CF6", icon: "🛣️" },
  { type: "auth", label: "Auth", color: "#06B6D4", icon: "🔐" },
  { type: "storage", label: "Local Storage", color: "#84CC16", icon: "💾" },
  { type: "user", label: "User", color: "#F97316", icon: "👤" },
  { type: "modal", label: "Modal", color: "#EC4899", icon: "🪟" },
  { type: "form", label: "Form", color: "#14B8A6", icon: "📝" },
  { type: "button", label: "Button", color: "#F97316", icon: "🔘" },
  { type: "input", label: "Input", color: "#8B5CF6", icon: "📥" },
];

const shapeTypes = [
  { type: "rectangle", label: "Rectangle", color: "#6B7280" },
  { type: "circle", label: "Circle", color: "#6B7280" },
  { type: "diamond", label: "Diamond", color: "#6B7280" },
  { type: "hexagon", label: "Hexagon", color: "#6B7280" },
];

const arrowTypes = [
  { type: "arrow", label: "Arrow", color: "#2ad17e" },
  { type: "dashed-arrow", label: "Dashed Arrow", color: "#2ad17e" },
  { type: "curved-arrow", label: "Curved Arrow", color: "#2ad17e" },
  { type: "double-arrow", label: "Double Arrow", color: "#2ad17e" },
];

export default function SystemDesignPlayground() {
  const [components, setComponents] = useState<Component[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [selectedArrowType, setSelectedArrowType] = useState<string>("arrow");
  const [activeTab, setActiveTab] = useState<'components' | 'shapes' | 'arrows'>('components');
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const addComponent = (type: string, shape?: string) => {
    const componentType = componentTypes.find(ct => ct.type === type);
    const shapeType = shapeTypes.find(st => st.type === shape);
    
    if (!componentType && !shapeType) return;

    const newComponent: Component = {
      id: `comp_${Date.now()}`,
      type: type || shape || 'rectangle',
      x: Math.random() * (canvasSize.width - 150),
      y: Math.random() * (canvasSize.height - 100),
      width: 120,
      height: 80,
      label: componentType?.label || shapeType?.label || 'Shape',
      color: componentType?.color || shapeType?.color || '#6B7280',
      shape: shape || 'rectangle',
    };

    setComponents(prev => [...prev, newComponent]);
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setConnections(prev => prev.filter(conn => 
      conn.from !== id && conn.to !== id
    ));
    setSelectedComponent(null);
  };

  const startConnection = (componentId: string) => {
    if (isConnecting) {
      if (connectionStart !== componentId) {
        // Complete connection
        const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          from: connectionStart!,
          to: componentId,
          arrowType: selectedArrowType,
        };
        setConnections(prev => [...prev, newConnection]);
      }
      setIsConnecting(false);
      setConnectionStart(null);
    } else {
      // Start connection
      setIsConnecting(true);
      setConnectionStart(componentId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    setSelectedComponent(componentId);
    setDraggedComponent(componentId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedComponent && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 60; // Center the component
      const y = e.clientY - rect.top - 40;
      
      updateComponent(draggedComponent, {
        x: Math.max(0, Math.min(x, canvasSize.width - 120)),
        y: Math.max(0, Math.min(y, canvasSize.height - 80))
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedComponent(null);
  };

  const getComponentPosition = (comp: Component) => {
    return {
      left: comp.x,
      top: comp.y,
      width: comp.width,
      height: comp.height,
    };
  };

  const getConnectionPath = (connection: Connection) => {
    const fromComp = components.find(c => c.id === connection.from);
    const toComp = components.find(c => c.id === connection.to);
    
    if (!fromComp || !toComp) return "";

    const fromX = fromComp.x + fromComp.width / 2;
    const fromY = fromComp.y + fromComp.height / 2;
    const toX = toComp.x + toComp.width / 2;
    const toY = toComp.y + toComp.height / 2;

    if (connection.arrowType === 'curved-arrow') {
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const controlX = midX + (Math.random() - 0.5) * 100;
      const controlY = midY + (Math.random() - 0.5) * 100;
      return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
    }

    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  const getConnectionStyle = (connection: Connection) => {
    const baseStyle = {
      stroke: "#2ad17e",
      strokeWidth: "2",
      fill: "none",
    };

    if (connection.arrowType === 'dashed-arrow') {
      return { ...baseStyle, strokeDasharray: "5,5" };
    }

    return baseStyle;
  };

  const clearCanvas = () => {
    setComponents([]);
    setConnections([]);
    setSelectedComponent(null);
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const startChallenge = (challenge: any) => {
    setCurrentChallenge(challenge);
    setShowEditor(true);
    clearCanvas();
    
    // Add starter components based on challenge
    setTimeout(() => {
      if (challenge.title.includes('Dashboard')) {
        addComponent('page');
        addComponent('component');
        addComponent('api');
        addComponent('state');
      } else if (challenge.title.includes('Form')) {
        addComponent('form');
        addComponent('input');
        addComponent('button');
        addComponent('router');
      } else if (challenge.title.includes('Chat')) {
        addComponent('user');
        addComponent('component');
        addComponent('api');
        addComponent('storage');
      } else {
        addComponent('page');
        addComponent('component');
        addComponent('state');
      }
    }, 100);
  };

  const backToChallenges = () => {
    setShowEditor(false);
    setCurrentChallenge(null);
    clearCanvas();
  };

  const exportDiagram = () => {
    const diagramData = {
      components,
      connections,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(diagramData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-design-diagram.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Challenge selection view
  if (!showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Frontend Architecture Challenges</h1>
            <p className="text-white/80">
              Choose a challenge and design the frontend architecture using our visual editor
            </p>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Design a React Component Library",
                description: "Create a scalable component system with proper state management",
                difficulty: "Medium",
                requirements: [
                  "Component hierarchy design",
                  "State management strategy",
                  "Props interface definition",
                  "Styling approach (CSS-in-JS, styled-components, etc.)"
                ]
              },
              {
                title: "Build a Real-time Dashboard",
                description: "Design a dashboard with live data updates and WebSocket connections",
                difficulty: "Hard",
                requirements: [
                  "Real-time data flow",
                  "WebSocket integration",
                  "State synchronization",
                  "Performance optimization"
                ]
              },
              {
                title: "Create a Multi-step Form Flow",
                description: "Design a complex form with validation, progress tracking, and state persistence",
                difficulty: "Medium",
                requirements: [
                  "Form state management",
                  "Validation logic",
                  "Progress tracking",
                  "Data persistence"
                ]
              },
              {
                title: "Design a File Upload System",
                description: "Build a drag-and-drop file upload with progress tracking and preview",
                difficulty: "Medium",
                requirements: [
                  "Drag-and-drop interface",
                  "Progress tracking",
                  "File validation",
                  "Preview functionality"
                ]
              },
              {
                title: "Create a Search Interface",
                description: "Design a search system with filters, autocomplete, and result pagination",
                difficulty: "Medium",
                requirements: [
                  "Search input handling",
                  "Filter system",
                  "Autocomplete suggestions",
                  "Result pagination"
                ]
              },
              {
                title: "Build a Chat Interface",
                description: "Design a real-time chat with message threading and file sharing",
                difficulty: "Hard",
                requirements: [
                  "Real-time messaging",
                  "Message threading",
                  "File sharing",
                  "User presence"
                ]
              },
              {
                title: "Design a Data Visualization App",
                description: "Create interactive charts and graphs with real-time data updates",
                difficulty: "Hard",
                requirements: [
                  "Chart library integration",
                  "Data transformation",
                  "Interactive features",
                  "Responsive design"
                ]
              },
              {
                title: "Build a User Authentication Flow",
                description: "Design login, registration, and password reset flows with proper validation",
                difficulty: "Medium",
                requirements: [
                  "Authentication forms",
                  "Validation logic",
                  "Error handling",
                  "Security considerations"
                ]
              },
              {
                title: "Create a Mobile-First Responsive Layout",
                description: "Design a responsive interface that works seamlessly across all devices",
                difficulty: "Easy",
                requirements: [
                  "Mobile-first approach",
                  "Breakpoint strategy",
                  "Flexible layouts",
                  "Touch interactions"
                ]
              }
            ].map((challenge, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-6 ring-1 ring-white/15 hover:bg-white/15 transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{challenge.title}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                    challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <p className="text-white/70 mb-4 text-sm">{challenge.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/90 mb-2">Key Requirements:</h4>
                  <ul className="text-xs text-white/60 space-y-1">
                    {challenge.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-start gap-2">
                        <span className="text-[#2ad17e] mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={() => startChallenge(challenge)}
                  className="w-full px-4 py-3 bg-[#2ad17e] text-[#0e1a12] rounded-lg font-medium hover:bg-[#2ad17e]/90 transition"
                >
                  Start Challenge
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Editor view
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header with Back Button */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={backToChallenges}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <span>←</span>
              <span>Back to Challenges</span>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{currentChallenge?.title}</h1>
              <p className="text-white/80 text-sm">{currentChallenge?.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs ${
              currentChallenge?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
              currentChallenge?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {currentChallenge?.difficulty}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Component Palette */}
          <div className="bg-white/10 rounded-lg p-4 ring-1 ring-white/15 flex flex-col max-h-full overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Design Elements</h3>
            
            {/* Tabs */}
            <div className="flex mb-4 bg-white/5 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex-1 px-3 py-2 text-xs rounded transition ${
                  activeTab === 'components' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('shapes')}
                className={`flex-1 px-3 py-2 text-xs rounded transition ${
                  activeTab === 'shapes' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Shapes
              </button>
              <button
                onClick={() => setActiveTab('arrows')}
                className={`flex-1 px-3 py-2 text-xs rounded transition ${
                  activeTab === 'arrows' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Arrows
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto mb-4 min-h-0">
              {/* Components Tab */}
              {activeTab === 'components' && (
                <div className="space-y-2">
                  {componentTypes.map((compType) => (
                    <button
                      key={compType.type}
                      onClick={() => addComponent(compType.type)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-left"
                    >
                      <span className="text-xl">{compType.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{compType.label}</div>
                        <div 
                          className="w-4 h-2 rounded"
                          style={{ backgroundColor: compType.color }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Shapes Tab */}
              {activeTab === 'shapes' && (
                <div className="space-y-2">
                  {shapeTypes.map((shapeType) => (
                    <button
                      key={shapeType.type}
                      onClick={() => addComponent('', shapeType.type)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-left"
                    >
                      <div 
                        className={`w-6 h-6 rounded ${
                          shapeType.type === 'circle' ? 'rounded-full' :
                          shapeType.type === 'diamond' ? 'rotate-45' :
                          shapeType.type === 'hexagon' ? 'hexagon' : ''
                        }`}
                        style={{ backgroundColor: shapeType.color }}
                      ></div>
                      <div>
                        <div className="font-medium text-sm">{shapeType.label}</div>
                        <div 
                          className="w-4 h-2 rounded"
                          style={{ backgroundColor: shapeType.color }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Arrows Tab */}
              {activeTab === 'arrows' && (
                <div className="space-y-2">
                  {arrowTypes.map((arrowType) => (
                    <button
                      key={arrowType.type}
                      onClick={() => setSelectedArrowType(arrowType.type)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${
                        selectedArrowType === arrowType.type
                          ? 'bg-[#2ad17e]/20 ring-1 ring-[#2ad17e]/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12h14m-7-7l7 7-7 7"
                          stroke={arrowType.color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray={arrowType.type === 'dashed-arrow' ? '5,5' : 'none'}
                        />
                      </svg>
                      <div>
                        <div className="font-medium text-sm">{arrowType.label}</div>
                        <div className="text-xs text-white/60">
                          {selectedArrowType === arrowType.type ? 'Selected' : 'Click to select'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 flex-shrink-0 mt-auto">
              <button
                onClick={clearCanvas}
                className="w-full px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
              >
                Clear Canvas
              </button>
              <button
                onClick={exportDiagram}
                className="w-full px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition"
              >
                Export Diagram
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-sm text-white/60 flex-shrink-0">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Click components/shapes to add them</li>
                <li>• Drag to move elements</li>
                <li>• Click elements to connect with arrows</li>
                <li>• Select arrow type before connecting</li>
                <li>• Right-click to delete</li>
              </ul>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3 bg-white/5 rounded-lg p-4 ring-1 ring-white/15 relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold">Design Canvas</h3>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>{components.length} components</span>
                <span>•</span>
                <span>{connections.length} connections</span>
              </div>
            </div>

            {/* Challenge Requirements */}
            <div className="mb-4 bg-white/10 rounded-lg p-4 flex-shrink-0">
              <h4 className="text-sm font-medium mb-3">Challenge Requirements:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {currentChallenge?.requirements.map((req: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white/5 rounded text-xs">
                    <div className="w-4 h-4 rounded-full bg-[#2ad17e]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#2ad17e] text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-white/80">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={canvasRef}
              className="flex-1 bg-[#0f131a] rounded-lg border-2 border-dashed border-white/20 relative overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={() => setSelectedComponent(null)}
            >
              {/* Grid Background */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((connection) => (
                  <g key={connection.id}>
                    <path
                      d={getConnectionPath(connection)}
                      {...getConnectionStyle(connection)}
                      markerEnd="url(#arrowhead)"
                    />
                    {connection.label && (
                      <text
                        x={(parseFloat(getConnectionPath(connection).split(' ')[1]) + parseFloat(getConnectionPath(connection).split(' ')[4])) / 2}
                        y={(parseFloat(getConnectionPath(connection).split(' ')[2]) + parseFloat(getConnectionPath(connection).split(' ')[5])) / 2}
                        fill="#2ad17e"
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {connection.label}
                      </text>
                    )}
                  </g>
                ))}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#2ad17e"
                    />
                  </marker>
                </defs>
              </svg>

              {/* Components */}
              {components.map((component) => (
                <div
                  key={component.id}
                  className={`absolute cursor-move select-none ${
                    selectedComponent === component.id ? 'ring-2 ring-[#2ad17e]' : ''
                  } ${isConnecting ? 'cursor-crosshair' : ''}`}
                  style={getComponentPosition(component)}
                  onMouseDown={(e) => handleMouseDown(e, component.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    deleteComponent(component.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startConnection(component.id);
                  }}
                >
                  <div
                    className={`w-full h-full border-2 flex flex-col items-center justify-center text-center p-2 ${
                      component.shape === 'circle' ? 'rounded-full' :
                      component.shape === 'diamond' ? 'rotate-45' :
                      component.shape === 'hexagon' ? 'hexagon' : 'rounded-lg'
                    }`}
                    style={{
                      backgroundColor: component.color,
                      borderColor: selectedComponent === component.id ? '#2ad17e' : component.color,
                    }}
                  >
                    <div className="text-lg mb-1">
                      {componentTypes.find(ct => ct.type === component.type)?.icon || '🔷'}
                    </div>
                    <div className="text-xs font-medium text-white">
                      {component.label}
                    </div>
                  </div>
                </div>
              ))}

              {/* Connection Mode Indicator */}
              {isConnecting && (
                <div className="absolute top-4 left-4 bg-[#2ad17e]/20 text-[#2ad17e] px-3 py-2 rounded-lg text-sm">
                  Click another component to connect
                </div>
              )}

              {/* Empty State */}
              {components.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-white/40">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏗️</div>
                    <div className="text-lg font-medium mb-2">Start Building Your System</div>
                    <div className="text-sm">Add components from the palette to begin designing</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}