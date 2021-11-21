import { useMemo, useState } from "react";
import RaceChart from "../component/RaceChart";
import useInterval from "../hook/useInterval";
import { stringToColor } from "../util/util";

const getRandomIndex = (array) => {
  return Math.floor(array.length * Math.random());
};

const randomData = ['O-O', 'O-O-O', 'e8Q', 'Rdf8', 'Be5'];

const Chart = () => {
  const [iteration, setIteration] = useState(0);
  const [start, setStart] = useState(false);
  const [data, setData] = useState({});

  useInterval(() => {
    if (start) {
      const randomIndex = getRandomIndex(randomData);
      const dataToAdd = randomData[randomIndex];
      const dataCopy = { ...data, [dataToAdd]: (data[dataToAdd] || 0) + (Math.floor(Math.random() * 50)) }
      setData(dataCopy);

      setIteration(iteration + 1);
    }
  }, 200);

  const chartData = useMemo(() => {
    return Object.keys(data).map((key) => {
      return {
        name: key,
        value: data[key],
        color: stringToColor(key)
      };
    });
  }, [data]);

  return (
    <>
      <h1>Hello World!</h1>
      <RaceChart data={chartData} />
      <button onClick={() => setStart(!start)}>
        {start ? "Stop the race" : "Start the race!"}
      </button>
      <p>Iteration: {iteration}</p>
    </>
  );
};

export default Chart;