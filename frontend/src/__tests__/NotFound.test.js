import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';

import NotFound from '../components/NotFound';

/**
 * @param {number} width
 */
function setWidth(width) {
  global.innerWidth = width;
  act(() => {
    global.dispatchEvent(new Event('resize'));
  });
}

/** */
function setNarrow() {
  setWidth(550);
}

/**
* Check that 404 is displayed
*/
test('Not Found', async () => {
  render(<NotFound />);
  setNarrow();
  const title = await screen.findByLabelText('not-found');
  expect(title).not.toBe(undefined);
  expect(title.innerHTML).toBe('404 PAGE NOT FOUND');
});
