module LoadmasterAssets
  class Engine < ::Rails::Engine
    initializer 'loadmaster_assets.load_static_assets' do |app|
      app.middleware.use ::ActionDispatch::Static, "#{root}/vendor"
    end
  end
end