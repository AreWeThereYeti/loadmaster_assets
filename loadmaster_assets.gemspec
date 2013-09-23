$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "loadmaster_assets/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "loadmaster_assets"
  s.version     = LoadmasterAssets::VERSION
  s.authors     = ["Andreas Sprotte"]
  s.email       = ["andreas@sprotte.dk"]
  s.homepage    = "https://github.com/AreWeThereYeti/loadmaster_assets"
  s.summary     = "LoadmasterAssets"
  s.description = "Description of LoadmasterAssets."

  s.files = Dir["{lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]
  
  s.require_paths = ["lib"]

  s.add_dependency "rails", "~> 4.0.0"

  s.add_development_dependency "sqlite3"
  s.add_development_dependency 'minitest' # <------- here
  s.add_development_dependency 'capybara' # <------- and here
end
