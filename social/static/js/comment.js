var CommentForm = React.createClass({
	getInitialState: function() {
		return {text: ''};
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var text = this.state.text.trim();
		if (!text) {
			return;
		}
		this.props.onCommentSubmit({text: text});
		this.setState({text: ''});
	},

	render: function() {
		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input className="form-control" type="text" value={this.state.text} onChange={this.handleTextChange} />
				<input className="btn btn-primary btns-sm" type="submit" value="Reply" />
			</form>
		);
	}
});

var CommentBox = React.createClass({displayName: 'CommentBox',
	getInitialState: function() {
		return {data: []};
	},

	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	componentDidMount: function() {
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	
	render: function() {
		return (
			<div class="commentBox">
				<h2>Comments</h2>
				<CommentList url={this.props.url} data={this.state.data} />
			</div>
		)
	}
});

var CommentList = React.createClass({
	render: function() {
		var commentNodes = this.props.data.map(function(comment) {
			return (
					<Comment author={comment.author} key={comment.id} sent={comment.sent} text={comment.text}>
						<SubcommentList data={comment.sub} />
					</Comment>
			);
		});

		return (
			<div className="commentList">
				{commentNodes}
			</div>
		)
	}
});

var SubcommentList = React.createClass({
	handleCommentSubmit: function(comment) {
		$.ajax({
			url: "/comment/"+comment.id+"/reply",
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		var commentNodes = this.props.data.map(function(comment) {
			return (
				<Comment author={comment.author} key={comment.id} sent={comment.sent} text={comment.text}>
				</Comment>
			);
		});

		return (
			<div className="commentList">
				{commentNodes}
				<CommentForm onCommentSubmit={this.handleCommentSubmit}/>
			</div>
		)
	}
});

var Comment = React.createClass({
	rawMarkup: function() {
		var rawMarkup = marked(this.props.text.toString(), {sanitize: true});
		return { __html: rawMarkup };
	},

	render: function() {
		return (
			<div className="panel panel-default comment">
				<div className="panel-heading">
					<h3 className="panel-title commentAuthor">
						{this.props.author}
					</h3>
				</div>
				<div className="panel-body">
					<span dangerouslySetInnerHTML={this.rawMarkup()} />
					{this.props.sent}
					{this.props.children}
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<CommentBox url="/dashboard/comments/" pollInterval={10000}/>,
	document.getElementById('comments')
);