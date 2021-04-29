import React from 'react'

class Demo extends React.Component {

    state = {
        openModal: false
    }

    videoModal = () => {
        return (
            <div className="modal fade bd-example-modal-lg show" tabIndex="-1" role="dialog"
                 style={{display: 'block'}}
                 hidden={!this.state.openModal}
                 aria-labelledby="myLargeModalLabel">
                <div className="modal-dialog modal-xl modal-dialog-scrollable ">
                    <div className="modal-content mx-auto">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Results as Directed Graph</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                    onClick={this.closeModal}>
                                <h1 aria-hidden="true">&times;</h1>
                            </button>
                        </div>
                        <div className="modal-body">
                            {this.embeddedVideo()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    embeddedVideo = () => {
        return(
            <div className="video-responsive">
                <iframe width="560"
                        height="315"
                        src="https://www.youtube.com/embed/yljHnSItWRs"
                        title="video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                </iframe>
            </div>
        )
    }

    openModal = () => {
        this.setState({openModal: true})
    }

    closeModal = () => {
        this.setState({openModal: false})
    }

    render() {
        return (
            <div>
                <button className={"btn btn-info"} onClick={this.openModal}>Application Demo Video</button>
                {this.videoModal()}
            </div>
        )
    }

}


export default Demo;

