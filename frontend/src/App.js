import './App.css';
import SelectLabels from './Components/SelectLabels';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import PriceSlider from './Components/PriceSlider';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'


function App() {
  const getCpusNames = () => {
    axios.get('http://localhost:8000/getCpus')
    .then(response => {
      setCpuNames(response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const getCpuSeries = () => {
    axios.get('http://localhost:8000/getCpuSeries')
    .then(response => {
      setCpuSeries(response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const getGpusNames = () => {
    axios.get('http://localhost:8000/getGpus')
    .then(response => {
      setGpuNames(response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const getMbsNames = () => {
    axios.get('http://localhost:8000/getMbs')
    .then(response => {
      setMbNames(response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  function extractPcSpecification(question) {
    const cpuPattern = /(AMD Ryzen \d|Intel Core i\d+)/g;
    const pricePattern = /\d+(?= dollars)/g;
    const cpuMatch = question.match(cpuPattern);
    const cpuSeries = cpuMatch ? cpuMatch[0] : '';
    const priceMatch = question.match(pricePattern);
    const priceRange = priceMatch ? parseInt(priceMatch[0]) : 0;
    const pcSpecification = {
        CPU_SERIES: cpuSeries,
        PRICE_RANGE: priceRange
    };

    return pcSpecification;
}
  const checkCompatibility = () => {
    if (selectedCpuRight && selectedGpuRight && selectedMbRight) {
      axios.get('http://localhost:8000/checkCompat', {
        params: {
          cpu_name: selectedCpuRight,
          gpu_name: selectedGpuRight,
          mb_name: selectedMbRight
        } 
      }
      )
      .then(response => {
        if (response.data === true) {
          Swal.fire({
            position: "top-center",
            icon: "success",
            title: "Your components are compatible",
            showConfirmButton: false,
            timer: 1500
          });
        }
        else {
          Swal.fire({
            position: "top-cente",
            icon: "error",
            title: "Your components are not compatible",
            showConfirmButton: false,
            timer: 1500
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
    else {
      Swal.fire({
        position: "top-cente",
        icon: "error",
        title: "Please select all components",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const handlePcBuild = () => {
    if (selectedCpuLeft) {
      const priceRangeString = price.join(',');
      axios.get('http://localhost:8000/buildPc', {
        params: {
          cpu_name: selectedCpuLeft,
          price_range_list: priceRangeString
        } 
      }
      )
      .then(response => {
        setResultCpu(response.data["CPU"]);
        setResultGpu(response.data["GPU"]);
        setResultMb(response.data["Motherboard"]);
        setResultPrice(response.data["Price"].toFixed(2));
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
    else if (question) {
      const result = extractPcSpecification(question);
      const myString = "0," + result["PRICE_RANGE"];
      axios.get('http://localhost:8000/buildPc', {
        params: {
          cpu_name: result["CPU_SERIES"],
          price_range_list: myString
        } 
      }
      )
      .then(response => {
        setResultCpu(response.data["CPU"]);
        setResultGpu(response.data["GPU"]);
        setResultMb(response.data["Motherboard"]);
        setResultPrice(response.data["Price"].toFixed(2));
      })
      .catch(error => {
        console.error('Error:', error);
      });
      
      console.log(result);
    }
    else {
      Swal.fire({
        position: "top-cente",
        icon: "error",
        title: "Please provide all necessary informations",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const [cpuNames, setCpuNames] = useState([]);
  const [cpuSeries, setCpuSeries] = useState([]);
  const [gpuNames, setGpuNames] = useState([]);
  const [mbNames, setMbNames] = useState([]);
  const [selectedCpuLeft, setSelectedCpuLeft] = useState('');
  const [selectedCpuRight, setSelectedCpuRight] = useState('');
  const [selectedGpuRight, setSelectedGpuRight] = useState('');
  const [selectedMbRight, setSelectedMbRight] = useState('');
  const [price, setPrice] = useState([200, 1000]);
  const [resultCpu, setResultCpu] = useState("Processor");
  const [resultGpu, setResultGpu] = useState("Graphic Card");
  const [resultMb, setResultMb] = useState("Motherboard");
  const [resultPrice, setResultPrice] = useState("Price");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    getCpuSeries();
    getCpusNames();
    getGpusNames();
    getMbsNames();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="half">
            <p>
              <TextField
                id="standard-basic"
                label="Provide your question" 
                variant="standard"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                inputProps={{ style: { color: 'white', width: '500px' } }} 
                InputLabelProps={{ style: { color: 'white' } }} 
              />
            </p>
            <p>
              <label style={{color: "white"}}>Or select Desired CPU Family and price range</label>
            </p>
            <SelectLabels
              name="CPU"
              values={cpuSeries.filter(
                (value, index, self) => {
                  return value !== null && self.indexOf(value) === index;
              }
              ).sort()}
              selectedComponent={selectedCpuLeft}
              setSelectedComponent={setSelectedCpuLeft}
              />
            <label style={{color: "white"}}>Price ($)</label>
            <PriceSlider
              value={price}
              setValue={setPrice}
            />
            <p>
              <Button 
                variant="contained"
                onClick={handlePcBuild}
              >
                Submit
              </Button>
            </p>
            <TextField
                id="result-cpu"
                label={resultCpu}
                disabled={"true"}
                variant="standard" 
                inputProps={{ style: { width: "500px",  color: 'white' } }} 
                InputLabelProps={{ style: { color: 'white' } }} 
              />
            <TextField
                id="result-gpu"
                label={resultGpu}
                variant="standard" 
                disabled={"true"}
                inputProps={{ style: { width: "500px", color: 'white' } }} 
                InputLabelProps={{ style: { color: 'white' } }} 
              />
              <TextField
                id="result-motherboard"
                label={resultMb}
                disabled={"true"}
                variant="standard" 
                inputProps={{ style: { width: "500px", color: 'white' } }} 
                InputLabelProps={{ style: { color: 'white' } }} 
              />
              <TextField
                id="result-price"
                label={resultPrice}
                disabled={"true"}
                variant="standard" 
                inputProps={{ style: { color: 'white' } }} 
                InputLabelProps={{ style: { color: 'white' } }} 
              />
            
        </div>
        <div className="half">
            <SelectLabels
              name="CPU"
              values={cpuNames}
              selectedComponent={selectedCpuRight}
              setSelectedComponent={setSelectedCpuRight}
              />
            <SelectLabels
              name="GPU"
              values={gpuNames} 
              selectedComponent={selectedGpuRight}
              setSelectedComponent={setSelectedGpuRight}
              />
            <SelectLabels
              name="MOTHERBOARD"
              values={mbNames}
              selectedComponent={selectedMbRight}
              setSelectedComponent={setSelectedMbRight}
              />
            <p>
              <Button 
                variant="contained"
                onClick={checkCompatibility}
                >
                  Check compatibility
              </Button>
            </p>
        </div>
      </div>
  </div>
  );
}

export default App;
