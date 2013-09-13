$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "loadmaster_assets/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "loadmaster_assets"
  s.version     = LoadmasterAssets::VERSION
  s.authors     = ["Andreas Sprotte","Mikkel Markvardsen"]
  s.email       = ["andreas@sprotte.dk"]
  s.homepage    = "http://www.asprotte.com"
  s.summary     = "assets"
  s.description = "assets for loadmaster logger mobile and web applications"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.0.0"

  s.add_development_dependency "sqlite3"
end
