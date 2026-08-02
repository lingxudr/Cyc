/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import HomePage from '../frontend/src/app/page';
import { Providers } from '../frontend/src/app/providers';

export default function App() {
  return (
    <Providers>
      <HomePage />
    </Providers>
  );
}
