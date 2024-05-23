import { TestController } from '../common/test-controller';
import { TestSection } from '../common/test-section';

import Worker from './worker?worker';

class Controller extends TestController {
	constructor() {
		super();
		this._options.width = 96;
		this._options.height = 48;
		this._count = 20;
	}

	protected _initWorker() {
		this._worker = new Worker();
	}
}

export function PredefinedPage() {
	return TestSection( () => new Controller, 'Predefined Model Example' );
}