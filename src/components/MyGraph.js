class MyGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {nodes: props.nodes};
    }

    componentDidMount() {
        this.force = d3.forceSimulation(this.state.nodes)
            .force("charge",
                d3.forceManyBody()
                    .strength(this.props.forceStrength)
            )
            .force("x", d3.forceX(this.props.width / 2))
            .force("y", d3.forceY(this.props.height / 2));

        this.force.on('tick', () => this.setState({nodes: this.state.nodes}));
    }

    componentWillUnmount() {
        this.force.stop();
    }

    render() {
        return (
            <svg width={this.props.width} height={this.props.height}>
                {this.state.nodes.map((node, index) =>(
                    <circle r={node.r} cx={node.x} cy={node.y} fill="red" key={index}/>
                ))}
            </svg>
        );
    }
}

MyGraph.defaultProps = {
    width: 300,
    height: 300,
    forceStrength: -10
};

const nodes = [];
for (let i = 0; i < 100; i++) {
    nodes.push({
        r: (Math.random() * 5 ) + 2,
        x: 0,
        y: 0
    });
}

render(
    <MyGraph nodes={nodes} />,
    document.getElementById('container')
);