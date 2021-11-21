import { useRef, useEffect } from "react";
import { select, scaleBand, scaleLinear, max } from "d3";
import useResizeObserver from "../hook/useResizeObserver";

const RaceChart = ({ data }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  // will be called initially and on every data changes
  useEffect(() => {
    const svg = select(svgRef.current);
    if (!dimensions) return;

    // sorting the data
    data.sort((a, b) => b.value - a.value);

    const yScale = scaleBand()
      .paddingInner(0.1)
      .domain(data.map((_, index) => index))  // map to index only, [0, 1, 2, ...]
      .range([0, dimensions.height]);         // [0, 300], 300 depends on dimension height

    const xScale = scaleLinear()
      .domain([0, max(data, entry => entry.value)]) // [0, 65], 65 being the highest value
      .range([0, dimensions.width]); // [0, 300], 300 depends on dimension width

    svg
      .selectAll(".bar")
      .data(data, (entry, _) => entry.name)
      .join((enter) => enter.append("rect").attr("y", (_, index) => yScale(index)))
      .attr("fill", (entry) => entry.color)
      .attr("class", "bar")
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .transition()
      .attr("width", (entry) => xScale(entry.value))
      .attr("y", (_, index) => yScale(index));

    svg
      .selectAll(".label")
      .data(data, (entry, index) => entry.name)
      .join(enter =>
        enter
          .append("text")
          .attr("y", (_, index) => yScale(index) + yScale.bandwidth() / 2 + 5)
      )
      .text(entry => `${entry.name} (${entry.value} vote(s))`)
      .attr("class", "label")
      .attr("x", 10)
      .transition()
      .attr("y", (_, index) => yScale(index) + yScale.bandwidth() / 2 + 5);

  }, [data, dimensions]);

  return (
    <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
      <svg style={{
        overflow: "visible",
        display: "block",
        width: "100%",
        height: "200px"
      }} ref={svgRef}></svg>
    </div>
  );
};

export default RaceChart;