// We need to import reflect-metadata at least once for inversify to work:
import "reflect-metadata";

// write function to be executed as global setup before all tests
export default async function beforeAllTests() {
   // add code here to be executed before all tests in the current test run
   return;
}
