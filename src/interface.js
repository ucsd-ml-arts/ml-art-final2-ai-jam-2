import React, {Component} from 'react';
import './interface.css';


export default class Interface extends Component {
    constructor(){
        super();
        this.state = {
            opacity: 1
        }
    }

    trigger(){
        this.setState({opacity: 0});
        setTimeout(()=>{
            this.setState({opacity: 1})
        }, 0.02)
    }

    render(){
        return (
            <div className="interface-container">
            <div className="title" >AI Jam 2</div>
                <div className="patch-container">            
                    {this.props.bassline && <div className="bassline">Bassline</div> }
                    {this.props.drums && (
                    <div className="drums-container">
                        <div className="drums-title">Drums</div>
                        <div className="drums-temperature">Temperature: <div className="drums-temperature-color">{Math.round(this.props.drumTemperature*10)/10}</div></div>
                    </div>
                    )}
                    {this.props.melody && (
                    <div className="melody-container">
                        <div className="melody-title">Melody</div>
                    </div>
                    )}   
                {this.props.aiMelody && (
                    <div className="ai-melody-container">
                        <div className="ai-melody-title">Generated Melody</div>
                        <div className="ai-melody-temperature">Temperature: <div className="ai-melody-temperature-color">{Math.round(this.props.melodyTemperature*10)/10}</div></div>
                    </div>
                    )}     
                    <div className="status" style={{opacity: this.state.opacity}}>{this.props.status}</div>
                </div>
            </div>            
        )
    }
}