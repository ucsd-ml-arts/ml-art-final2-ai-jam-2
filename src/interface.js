import React, {Component} from 'react';
import './interface.css';

export default class Interface extends Component {
    render(){
        return (
            <div className="interface-container">
                {this.props.bassline && <div className="bassline">Bassline</div> }
                {this.props.drums && (
                <div className="drums-container">
                    <div className="drums-title">Drums</div>
                    <div className="drums-temperature">Temperature: <div className="drums-temperature-color">{this.props.drumTemperature}</div></div>
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
                    <div className="ai-melody-temperature">Temperature: <div className="ai-melody-temperature-color">{this.props.melodyTemperature}</div></div>
                </div>
                )}     
                <div className="status">{this.props.status}</div>
            </div>
            
        )
    }
}