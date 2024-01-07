// WICHTIG: pm2 muss mit --env development bzw. --env production gestartet werden

module.exports = {
	apps: [{
		name: "backend",
		script: "backend/run.js",
		exec_mode: "cluster",
		instances: 4,
		watch: true,
		instance_var: 'INSTANCE_ID_EXOMAG',
		env_development: {
			PORT: 9000,
			NODE_ENV: "development",
			REACT_APP_INSTANCE_ID: "EXOMAG"
		},
		env_production: {
			PORT: 9000,
			NODE_ENV: "production",
			REACT_APP_INSTANCE_ID: "EXOMAG"
		}
	}]
}
