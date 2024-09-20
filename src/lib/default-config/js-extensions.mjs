export const stdExts = ['.js', '.cjs', '.mjs']
export const jsxExts = ['.jsx']
export const allExts = [...stdExts, ...jsxExts]
export const stdExtsStr = stdExts.join(',')
export const jsxExtsStr = jsxExts.join(',')
export const allExtsStr = allExts.join(',')