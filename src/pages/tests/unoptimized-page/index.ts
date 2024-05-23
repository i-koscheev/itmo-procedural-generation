import { TestController } from '../common/test-controller';
import { TestSection } from '../common/test-section';

import Worker from './worker?worker';

class Controller extends TestController {
	protected _initWorker() {
		this._worker = new Worker();
	}
}

export function UnoptimizedPage() {
	return TestSection( () => new Controller, 'No optimization' );
}