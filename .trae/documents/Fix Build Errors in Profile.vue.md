## Modify Build Script to Report Errors Without Blocking Build

### Issue Analysis
The current build script `vue-tsc -b && vite build` fails completely when TypeScript errors are encountered because it uses the `&&` operator, which stops execution if the previous command fails.

### User Requirement
The user wants:
- TypeScript errors to be displayed (reported)
- The build process to continue and complete successfully even if TypeScript errors exist

### Solution
Modify the build script to use the logical OR operator `||` instead of the logical AND operator `&&`. This way:
1. `vue-tsc -b` will run and display all TypeScript errors
2. Even if `vue-tsc -b` exits with an error code, `vite build` will still execute
3. The final build will complete successfully, while still showing all TypeScript errors

### Files to Modify
1. `package.json` - Update the build script from `vue-tsc -b && vite build` to `vue-tsc -b || vite build`

### Expected Outcome
- TypeScript errors will be reported in the terminal output
- The build process will continue and complete successfully
- The final bundled files will be generated as expected
- Developers can see the errors but the build won't be blocked

### Alternative Options Considered
1. Disabling specific TypeScript rules - Would hide errors completely, which is not what the user wants
2. Using `--noEmit` flag - Would still fail on errors, just without emitting files
3. Fixing the actual errors - Would resolve the build failure but doesn't address the user's core requirement of allowing builds with errors

### Verification Steps
1. Run `npm run build` after modifying the script
2. Verify that TypeScript errors are displayed in the output
3. Verify that the build completes successfully and generates the bundled files
4. Check the `dist` directory to confirm the build artifacts are present