import { Link } from 'react-router-dom';

export function HomePage() {
	return (
		<section className="section">
			<h1>Web Procedural Generation</h1>
			<Link to="/unoptimized" >
				Run original model (no optimization)
			</Link>
			<Link to="/overlapping" >
				Run model with typed arrays
			</Link>
			<Link to="/patterns" >
				Patterns generator
			</Link>
			<Link to="/predefined" >
				Predefined model
			</Link>
			<Link to="/trees" >
				Trees Example
			</Link>
			<Link to="/park" >
				Park Example
			</Link>
			<Link to="/grammar" >
				Building Example
			</Link>
			<Link to="/geojson" >
				Location Example
			</Link>
		</section>
	);
}