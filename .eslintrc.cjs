module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	plugins: [
		'react',
		'react-refresh',
		'react-hooks',
		'simple-import-sort',
		'@typescript-eslint'
	],
	rules: {
		'indent': ['warn', 'tab'],
		'linebreak-style': ['warn', 'unix'],
		'quotes': ['warn', 'single'],
		'semi': ['warn', 'always'],
		'object-curly-spacing': ['error', 'always'],
		'space-in-parens': ['warn', 'always', {
			'exceptions': ['empty']
		}],
		'jsx-quotes': ['warn', 'prefer-double'],
		'curly': 'error',
		'arrow-parens': ['error', 'always'],
		'indent': ['warn', 'tab'],
		'@typescript-eslint/ban-ts-comment': 'warn',
		'@typescript-eslint/no-unused-vars': ['warn', {
			'vars': 'all',
			'args': 'after-used',
			'ignoreRestSiblings': false,
			'varsIgnorePattern': '[iI]gnored',
			'caughtErrorsIgnorePattern': '^ignore',
			'argsIgnorePattern': '^_',
			'destructuredArrayIgnorePattern': '^_',
		}],
		'@typescript-eslint/consistent-type-imports': 'warn',
		'simple-import-sort/imports': 'warn',
		'simple-import-sort/exports': 'warn',
		// React
		'react/boolean-prop-naming': ['error', {
			'rule': '^(is|has|with)[A-Z]([A-Za-z0-9]?)+',
			'validateNested': true
		}],
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
		'react/jsx-indent-props': ['warn', 'tab'],
		'react/jsx-max-props-per-line': ['warn'],
		'react/jsx-closing-tag-location': ['error'],
		'react/jsx-closing-bracket-location': ['error'],
		'react/jsx-boolean-value': ['error', 'never'],
		'react-hooks/exhaustive-deps': 'warn'
	},
	'overrides': [
		// override "simple-import-sort" config
		{
			'files': ['*.js', '*.jsx', '*.ts', '*.tsx'],
			'rules': {
				'simple-import-sort/imports': ['warn', {
					'groups': [
						// Packages `react` related packages come first.
						['^react', '^@?\\w'],
						// Internal packages.
						['^(@|components)(/.*|$)'],
						// Side effect imports.
						['^\\u0000'],
						// Parent imports. Put `..` last.
						['^\\.\\.(?!/?$)', '^\\.\\./?$'],
						// Other relative imports. Put same-folder imports and `.` last.
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
						// Types
						['^.*(type|types)(/.*|$)'],
						// Style imports.
						['^.+\\.?(css)$']]
				}]
			}
		}
	],
}
