import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Brain, Loader2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";

interface GraphNode {
  id: string;
  label: string;
  size: number;
  count: number;
  color?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

interface KnowledgeGraphProps {
  teamId?: string;
  limit?: number;
}

export function KnowledgeGraph({ teamId, limit = 50 }: KnowledgeGraphProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const fgRef = useRef<any>(null);

  const API_URL = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetchKnowledgeGraph();
  }, [teamId, limit]);

  const fetchKnowledgeGraph = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (teamId) params.append("teamId", teamId);
      params.append("limit", limit.toString());

      const response = await axios.get(
        `${API_URL}/activities/knowledge-graph?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const graphData = response.data.graph;

      // Assign colors based on node importance
      const maxCount = Math.max(...graphData.nodes.map((n: GraphNode) => n.count));
      const coloredNodes = graphData.nodes.map((node: GraphNode) => {
        const intensity = node.count / maxCount;
        let color;
        if (intensity > 0.7) color = "#8b5cf6"; // Purple for high importance
        else if (intensity > 0.4) color = "#3b82f6"; // Blue for medium
        else color = "#06b6d4"; // Cyan for low

        return {
          ...node,
          color,
        };
      });

      setNodes(coloredNodes);
      setEdges(graphData.edges);
      setError("");
    } catch (err: any) {
      console.error("Error fetching knowledge graph:", err);
      setError("Failed to load knowledge graph");
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    if (!node) return;
    setSelectedNode(node);

    // Center on node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(4, 1000);
    }
  }, []);

  const handleNodeHover = useCallback((node: any) => {
    setHoverNode(node || null);

    if (node) {
      // Highlight node and connected nodes
      const connectedNodes = new Set<string>();
      const connectedLinks = new Set<string>();

      connectedNodes.add(node.id);

      edges.forEach(link => {
        if (link.source === node.id || link.target === node.id) {
          connectedLinks.add(`${link.source}-${link.target}`);
          connectedNodes.add(typeof link.source === 'object' ? (link.source as any).id : link.source);
          connectedNodes.add(typeof link.target === 'object' ? (link.target as any).id : link.target);
        }
      });

      setHighlightNodes(connectedNodes);
      setHighlightLinks(connectedLinks);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [edges]);

  const resetCamera = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  const zoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.5, 300);
    }
  };

  const zoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom / 1.5, 300);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Knowledge Graph</h3>
        </div>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || nodes.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Knowledge Graph</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Brain className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {error || "No data available yet. Start logging activities to build your knowledge graph!"}
          </p>
        </div>
      </div>
    );
  }

  const graphData = {
    nodes: nodes,
    links: edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      value: edge.weight,
    })),
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Knowledge Graph</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {nodes.length} topics · {edges.length} connections
          </div>
          <div className="flex gap-2">
            <button
              onClick={zoomIn}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={resetCamera}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Force Graph */}
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border border-border">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="label"
          nodeVal={(node: any) => Math.max(8, node.count * 3)}
          nodeColor={(node: any) =>
            highlightNodes.size > 0 && !highlightNodes.has(node.id)
              ? 'rgba(100, 100, 100, 0.3)'
              : node.color
          }
          nodeRelSize={8}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 12 / globalScale;
            const nodeRadius = Math.max(8, node.count * 2);
            const isHighlighted = highlightNodes.has(node.id);

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = isHighlighted || highlightNodes.size === 0
              ? node.color
              : 'rgba(100, 100, 100, 0.3)';
            ctx.fill();

            // Draw highlight ring if selected or hovered
            if (isHighlighted || node.id === selectedNode?.id) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeRadius + 2, 0, 2 * Math.PI);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }

            // Draw label
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, node.x, node.y + nodeRadius + fontSize);
          }}
          linkColor={(link: any) => {
            const linkId = `${link.source.id || link.source}-${link.target.id || link.target}`;
            return highlightLinks.size > 0 && !highlightLinks.has(linkId)
              ? 'rgba(100, 100, 100, 0.1)'
              : 'rgba(150, 150, 150, 0.5)';
          }}
          linkWidth={(link: any) => {
            const linkId = `${link.source.id || link.source}-${link.target.id || link.target}`;
            return highlightLinks.has(linkId) ? 2 : Math.max(0.5, link.value / 5);
          }}
          linkDirectionalParticles={(link: any) => {
            const linkId = `${link.source.id || link.source}-${link.target.id || link.target}`;
            return highlightLinks.has(linkId) ? 4 : Math.max(0, link.value / 10);
          }}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.006}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTime={3000}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          backgroundColor="rgba(0,0,0,0)"
          width={1000}
          height={600}
        />

        {/* Hover tooltip */}
        {hoverNode && (
          <div className="absolute top-4 left-4 bg-popover/95 text-popover-foreground px-4 py-2 rounded-lg shadow-lg border border-border pointer-events-none">
            <h4 className="font-semibold capitalize">{hoverNode.label}</h4>
            <p className="text-sm text-muted-foreground">
              {hoverNode.count} mentions
            </p>
          </div>
        )}

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 bg-popover/90 text-popover-foreground px-3 py-2 rounded-lg text-xs pointer-events-none">
          <p>🖱️ Drag to pan • Scroll to zoom • Click nodes to focus • Drag nodes to rearrange</p>
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-foreground capitalize">
                {selectedNode.label}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Mentioned {selectedNode.count} times in your activities
              </p>
              <div
                className="mt-2 w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedNode.color }}
                title="Node color"
              />
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-muted-foreground hover:text-foreground text-xl font-bold px-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Top topics list */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Top Topics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {nodes.slice(0, 12).map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between px-3 py-2 bg-secondary/50 rounded-md hover:bg-secondary transition-colors cursor-pointer group"
              onClick={() => handleNodeClick(node)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-sm text-foreground capitalize truncate group-hover:text-primary transition-colors">
                  {node.label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                {node.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
