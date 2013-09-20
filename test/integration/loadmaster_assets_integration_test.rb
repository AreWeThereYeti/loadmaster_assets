require 'test_helper'

describe "loadmaster assets integration" do
  it "provides testfile.js on the asset pipeline" do
    visit '/assets/testfile.js'
    page.text.must_include 'var test'
  end

  it "provides loadmaster.css on the asset pipeline" do
    visit '/assets/loadmaster.css'
    page.text.must_include '#loadmaster_asset {'
  end
end